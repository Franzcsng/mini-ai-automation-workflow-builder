import { workflowNode } from "../types"

type ConditionalOperator = 
| '===' 
| '!==' 
| '<' 
| '<=' 
| '>' 
| '>='

export async function conditionalNode(
    node: workflowNode, 
    resolvedInputs: Record<string, any>
) {
    const startedAt = Date.now()

    const left = resolvedInputs['left']
    const right = resolvedInputs['right']
    const operator = node.data.operator as ConditionalOperator
    
    let condition = false

    switch (operator) {
        case '===':
            condition = left === right
            break;
        case '!==':
            condition = left !== right
            break;
        case '<':
            condition = left < right
            break;
        case '<=':
            condition = left <= right
            break;
        case '>':
            condition = left > right
            break;
        case '>=':
            condition = left >= right
            break;
        default:
            throw new Error(`Unsupported operator: ${operator}`)
            break;
    }

  return {
    nodeId: node.id,
    success: true,
    output: {
      condition,
    },
    meta: {
      startedAt,
      finishedAt: Date.now()
    }
  }
}