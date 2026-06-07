import {workflowNode } from "../types"

export async function constantNode(
    node: workflowNode, 
    resolvedInputs: Record<string, any>
) {

    return {
        nodeId: node.id,
        success: true,
        output:{value: node.data.value},
        meta: {
            startedAt: Date.now(),
            finishedAt: Date.now()
        }
    }
}