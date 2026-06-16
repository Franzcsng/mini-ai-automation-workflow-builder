export type workflow = {
    id: string,
    nodes: workflowNode[],
    edges: workflowEdges[],
    version: string
}

export type workflowNode = {
    id: string,
    type: string,
    data: Record<string, any>,
    inputs?: Record<string, string>,
    execution?: {
      join: joinStrategy,
      state: string,
      attempts: number,
      delayMs: number,
      timeoutMs: number
    }
}

export type joinStrategy = "all" | "any"

export type workflowEdges = {
    id: string,
    source: string,
    target: string,
    condition?: boolean
}



export type NodeType =
  | "console.log"
  | "add.node"
  | "multiply.node"
  | "constant.node"
  | "testfail.node"
  | "conditional.node"
  | "approval.node" 


  export type NodeResult<T =  any> = {
    nodeId: string
    success: boolean
    waitingForInput?: boolean,
    output?: T,
    error?: string
    meta?: {
      startedAt: number
      finishedAt: number
    },
}


export type WorkflowContext = {
  status: "success" | "failed" | "partial" | "started" | "paused" | "running"
  results: Record<string, NodeResult>,
  executions: Record<string, NodeExecution>,
  pausedNodeId: string,
  startedAt: number,
  finishedAt: number,
  durationMs: number
}

export interface NodeExecution {
  status: "pending" | "running" | "success" | "failed" | "skipped" | "paused"
  startedAt?: number,
  finishedAt?: number,
  error?: string
}
