import {consoleLogNode} from "./nodes/consoleLog"
import { NodeType } from "./types"
// export const nodeRegistry: Record<
//   string,
//   (node: any) => Promise<any>
// > = {}

type NodeHandler = (node: any) => Promise<any>

export const nodeRegistry:Partial<Record<NodeType, NodeHandler>> = {
  "console.log": consoleLogNode
}