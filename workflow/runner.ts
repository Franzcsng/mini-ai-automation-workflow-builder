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


function isReady(
  nodeId: string, 
  dependencyMap: Record<string, string[]>, 
  completed: Set<string>
  ) {
    return dependencyMap[nodeId].every(dep => completed.has(dep))
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
      for(const node in dependencyMap){
        updatedMap[node] = dependencyMap[node].filter(dep => dep !== readyNode)
    }
  }

  return updatedMap
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
           nextReady.push(node)
        }
    }

    if (nextReady.length > 0) {
      ready.push(nextReady)
    }
  }

  return sorted
} 


export async function runWorkflow(workflow: workflow) {
  console.log("Starting DAG workflow...")

  const dependencyMap = buildDependencyMap(workflow)
  const completed = new Set<string>()
  let context: WorkflowContext = {
    results: {}
  }

  validateWorkflow(workflow)
  const layers = topologicalSort(workflow)
  console.log('TOPOLOGICAL SORT: ', topologicalSort(workflow))

  while (completed.size < workflow.nodes.length) {
    let progress = false

    for (const node of workflow.nodes) {
      if (completed.has(node.id)) continue

      if (!isReady(node.id, dependencyMap, completed)) continue
      
      console.log(`Executing node ${node.id} (${node.type})`)

      const handler = nodeRegistry[node.type as NodeType]

      if (!handler) {
        throw new Error(`No handler for ${node.type}`)
      }

      const result = await handler(node, resolveInputs(node.inputs ?? {}, context), context)

      context.results[node.id] = result
      completed.add(node.id)

      progress = true

    }

    if (!progress) {
      throw new Error("Workflow stuck — possible circular dependency or missing node")
    }
  }

  console.log("Workflow complete, here is the results: ", context.results)
  return context.results
}