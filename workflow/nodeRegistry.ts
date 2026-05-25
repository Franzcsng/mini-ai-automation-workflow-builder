import {consoleLogNode} from "./nodes/consoleLog"
import {addNode} from "./nodes/addNode"
import {multiplyNode} from "./nodes/multiplyNode"
import {constantNode} from "./nodes/constantNode"
import { NodeType, WorkflowContext} from "./types"

type NodeHandler = (node: any, resolvedInputs: Record<string, any>) => Promise<any>

export const nodeRegistry: Partial<Record<NodeType, NodeHandler>> = {
  "console.log": consoleLogNode,
  "add.node": addNode,
  "multiply.node": multiplyNode,
  "constant.node": constantNode
}