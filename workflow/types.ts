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
    retry?: {
      attempts: number,
      delayMs: number
    }
}


export type workflowEdges = {
    id: string,
    source: string,
    target: string
}



export type NodeType =
  | "console.log"
  | "add.node"
  | "multiply.node"
  | "constant.node"
  | "testfail.node"


  export type NodeResult<T =  any> = {
    nodeId: string
    success: boolean
    output?: T
    error?: string
    meta?: {
      startedAt: number
      finishedAt: number
    },
}


export type WorkflowContext = {
  results: Record<string, NodeResult>
}
