import { WorkflowContext, workflowNode } from "../types"

export async function consoleLogNode(
    node: workflowNode, 
    resolvedInputs: Record<string, any>
) {

    console.log('Message: ', node.data.message)
    
  return {
    nodeId: node.id,
    success: true,
    output: {
      message: node.data.message,
    },
    meta: {
      startedAt: Date.now(),
      finishedAt: Date.now()
    }
  }
}