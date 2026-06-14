import {consoleLogNode} from "./nodes/consoleLog"
import {addNode} from "./nodes/addNode"
import {multiplyNode} from "./nodes/multiplyNode"
import {constantNode} from "./nodes/constantNode"
import {testFailNode} from "./nodes/testFailNode"
import {conditionalNode} from "./nodes/conditionalNode"
import { NodeType, workflowNode, WorkflowContext} from "./types"

type NodeHandler = (
    node: workflowNode, 
    resolvedInputs: Record<string, any>, 
    context: WorkflowContext
  ) => Promise<any>

export const nodeRegistry: Partial<Record<NodeType, NodeHandler>> = {
  "console.log": consoleLogNode,
  "add.node": addNode,
  "multiply.node": multiplyNode,
  "constant.node": constantNode,
  "testfail.node": testFailNode,
  "conditional.node": conditionalNode
}