import {workflow} from "./types"
import { NodeType, WorkflowContext } from "./types"
import {nodeRegistry} from './nodeRegistry'

//This is the main function that runs the workflow basing on nodes and edges
// 1. buildDependency is a helper function that builds a dependency map which 
// returns a map of node ids to their dependencies
// 2. isReady function is a helper that checks if a node is ready to be run by checking
// if the dependencies are of the node are completed (exists in completed set), if so return true.
// 3. runWorkflow is the main function that runs the workflow. It loops through
// the dependency map and runs the nodes in the correct order

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


function isReady(nodeId: string, dependencyMap: Record<string, string[]>, completed: Set<string>) {
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


export async function runWorkflow(workflow: workflow) {
  console.log("Starting DAG workflow...")

  const dependencyMap = buildDependencyMap(workflow)
  const completed = new Set<string>()
  let context: WorkflowContext = {
    results: {}
  }

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

      const result = await handler(node, resolveInputs(node.inputs, context))

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