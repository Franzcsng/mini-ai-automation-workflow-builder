import {workflow} from "./types"
import { NodeType, WorkflowContext } from "./types"
import {nodeRegistry} from './nodeRegistry'
import { exists } from "fs"

//This is the main function that runs the workflow basing on nodes and edges
// 1. buildDependency is a helper function that builds a dependency map which 
// returns a map of node ids to their dependencies
// 2. isReady function is a helper that checks if a node is ready to be run by checking
// if the dependencies are of the node are completed (exists in completed set), if so return true.
// 3. runWorkflow is the main function that runs the workflow. It loops through
// the dependency map and runs the nodes in the correct order
// 4. resolvePath and resolveInputs are helper functions that resolve the path and inputs of the node. 
// resolvePath accepts the input path and returns the value of the path in the context object.
// resolveInputs accepts the inputs object and returns the resolved inputs mapped with their respective keys.


function validateUniqueNodeIds(workflow: workflow) {
  const nodeIds = new Set<string>()

  for (const node of workflow.nodes) {
    if (nodeIds.has(node.id)) {
      throw new Error(`Duplicate node id: ${node.id}`)
    }
    nodeIds.add(node.id)
  }
}


function validateEdges(workflow: workflow) {
  const nodeIds = new Set(workflow.nodes.map(node => node.id))

  for(const edge of workflow.edges){
    if (!nodeIds.has(edge.source)) {
      throw new Error(`Source node not found: ${edge.source}`)
    }
    if (!nodeIds.has(edge.target)) {
      throw new Error(`Target node not found: ${edge.target}`)
    }
  }
}

function validateNodeTypes(workflow: workflow) {
  for (const node of workflow.nodes) {
    if (!nodeRegistry[node.type as NodeType]) {
      throw new Error(`Unknown node type: ${node.type}`)
    }
  }
}

function getReferenceNode(path: string){
  return path.split('.')[0]
}
  
function validateInputReferences(workflow: workflow) {
  for(const node of workflow.nodes){
    
    if(!node.inputs) continue
    
    for(const input in node.inputs){
      
      const referenceNode = getReferenceNode(node.inputs[input])
     
      const hasDependency = workflow.edges.some(edge => 
        edge.source === referenceNode &&
        edge.target === node.id
      )

      if(!hasDependency){
        throw new Error(`Input reference ${input} and node ${referenceNode} is not a dependency of node ${node.id}`)
      }

    }
  }
}

function validateWorkflowCycle(workflow: workflow) {
  const dependencyMap = buildDependencyMap(workflow)

  const visited = new Set<string>()
  const inStack = new Set<string>()

  function dfs(nodeId: string) {
    if (inStack.has(nodeId)) {
      throw new Error(`Cycle detected at node: ${nodeId}`)
    }

    if (visited.has(nodeId)) return

    visited.add(nodeId)
    inStack.add(nodeId)

    const dependencies = dependencyMap[nodeId] || []

    for (const dep of dependencies) {
      dfs(dep)
    }

    inStack.delete(nodeId)
  }

  for (const node of workflow.nodes) {
    dfs(node.id)
  }
}

export function validateWorkflow(workflow: workflow) {
  validateUniqueNodeIds(workflow)
  validateEdges(workflow)
  validateNodeTypes(workflow)
  validateInputReferences(workflow)
  validateWorkflowCycle(workflow)
}

function buildDependencyMap(workflow: workflow){

    const dependencyMap: Record<string, string[]> = {}

    for(const nodes of workflow.nodes){
        dependencyMap[nodes.id] = []
    }

    for(const edges of workflow.edges){
        dependencyMap[edges.target].push(edges.source)
    }

    return dependencyMap
}

function resolvePath(path: string, context: WorkflowContext) {
    const result = path
    .split('.')
    .reduce<any>((acc, key) => acc?.[key], context.results)

    console.log("Resolving:", path, "=>", result)

    return result
}


function resolveInputs(inputs: Record<string, string>, context: WorkflowContext) {
    const resolvedInputs: Record<string, any> = {}

    for(const key in inputs){
        resolvedInputs[key] = resolvePath(inputs[key], context)
    }

    return resolvedInputs
}

function topologicalSortHelper(readyList: string[], dependencyMap: Record<string, string[]>){
  const updatedMap: Record<string, string[]> = { ...dependencyMap }

  for(const readyNode of readyList){
      for(const node in updatedMap){
        updatedMap[node] = updatedMap[node].filter(dep => dep !== readyNode)
      }
  }
  return {...updatedMap}
}

function topologicalSort(workflow: workflow) {
  let dependencyMap = buildDependencyMap(workflow)
  const sorted: string[][] = [] 
  let processed = new Set<string>()

  const firstLayer: string[] = []

  for(const node in dependencyMap){
      if(dependencyMap[node].length === 0){
          firstLayer.push(node)
      }
  }

  let ready: string[][] = [firstLayer]

  while(ready.length > 0){
  
    const readyList = ready.shift()
    if (!readyList || readyList.length === 0) continue
    dependencyMap = topologicalSortHelper(readyList, dependencyMap)  
  
    sorted.push([...readyList])
    const readySet = new Set(readyList)
    processed = new Set([...processed, ...readySet]);

    const nextReady: string[] = []

    for(const node in dependencyMap){
      
        if(dependencyMap[node].length === 0 && !processed.has(node)){
          console.log(`PUSHING NEXT ${node} FROM:`, dependencyMap)
           nextReady.push(node)
        }
    }

    if (nextReady.length > 0) {
      ready.push(nextReady)
    }
  }

  return sorted
} 

function findNode(workflow: workflow, nodeId: string) {
   const node = workflow.nodes.find(node => node.id === nodeId)
   if (!node) {
     throw new Error(`Node not found: ${nodeId}`)
   }
   return node
 }

 export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {

  const results: R[] = []
  let index = 0

  const runners: Promise<void>[] = []

  async function runNext() {
    while (index < items.length) {
      const currentIndex = index++
      const item = items[currentIndex]

      const result = await worker(item)
      results[currentIndex] = result
    }
  }

  for (let i = 0; i < limit; i++) {
    runners.push(runNext())
  }

  await Promise.all(runners)

  return results
}

async function executeWithRetry<t>(
  fn: () => Promise<t>,
  attempts: number,
  delayMs: number = 0
){
  let lastError: any
  
  for(let i = 0; i < attempts; i++){
    try{
      return await fn()
    }catch(e){
      lastError = e 

      if(i < attempts - 1 && delayMs > 0){      
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError
}

export async function runWorkflow(workflow: workflow) {
  console.log("Starting DAG workflow...")

  let context: WorkflowContext = {
    results: {}
  }

  validateWorkflow(workflow)
  const executionLayers = topologicalSort(workflow)
  console.log('TOPOLOGICAL SORT: ', executionLayers)

  for (const layer of executionLayers) {
    let workflowFailed = false

    const results = await runWithConcurrencyLimit(layer, 2, 
      async (nodeId) => {
        const node = findNode(workflow, nodeId)
        console.log(`Executing node ${nodeId} (${node.type})`)

        const handler =  nodeRegistry[node.type as NodeType]

        if (!handler) {
          throw new Error(`No handler for ${node.type}`)
        }
        
        try{
          const retryConfig = node.retry ?? { attempts: 1, delayMs: 0 }
          
          const result = await executeWithRetry(
            () => handler(node, resolveInputs(node.inputs ?? {}, context), context),
            retryConfig.attempts,
            retryConfig.delayMs
          )
        
          return {nodeId, result}

        }catch(e){
          
          return {
            nodeId, 
            result: {
              nodeId, 
              success: false, 
              error: e instanceof Error ? e.message : "Unknown Error",
              meta: {
                startedAt: Date.now(),
                finishedAt: Date.now()
              }
            }
          }

        }
      }
    )
    
    for (const { nodeId, result } of results) {
      context.results[nodeId] = result

      if(!result.success){
        console.log(`Workflow failed at node ${nodeId}, here is the results: `, context.results)
        return context.results
      }

    }
  }

  console.log("Workflow complete, here is the results: ", context.results)
  return context.results
}