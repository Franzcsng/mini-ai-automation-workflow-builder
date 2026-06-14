import { workflowNode } from "../types"

export async function consoleLogNode(
    node: workflowNode, 
    resolvedInputs: Record<string, any>
) {

  try{
    console.log('Message: ', node.data.message)
  }catch(e){
    console.log('console.log node error: ', e)

  }
  
    
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