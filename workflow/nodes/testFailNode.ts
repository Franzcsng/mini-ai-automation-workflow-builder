import {workflowNode } from "../types"

export async function testFailNode(node: workflowNode,  resolvedInputs: Record<string, any>) {
    throw new Error('Intentional Error')
}