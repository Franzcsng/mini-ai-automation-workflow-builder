import {workflowNode } from "../types"

export async function approvalNode(
    node: workflowNode, 
    resolvedInputs: Record<string, any>
    // humanInput?: any
){

    const message = node.data.message
    console.log("NEED APPROVAL: ", message)
    
    return {
        nodeId: node.id,
        success: true,
        waitingForInput: true,
        output:{
            message
        },
        meta: {
            startedAt: Date.now(),
            finishedAt: Date.now()
        }
    }
}