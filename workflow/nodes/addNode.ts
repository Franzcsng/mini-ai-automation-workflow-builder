import { WorkflowContext } from "../types"


export async function addNode(node: any,  resolvedInputs: Record<string, any>) {
    let result = 1

    for(const key in node.inputs){
        const value = resolvedInputs[key]
        console.log(`Adding ${value}`)
        result += value
    }

    console.log('Added: ', result)

    return {
        nodeId: node.id,
        success: true,
        output: {value: result},
        meta: {
            startedAt: Date.now(),
            finishedAt: Date.now()
        }
    }
}