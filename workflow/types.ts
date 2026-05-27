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
    inputs?: Record<string, string>
}


export type workflowEdges = {
    id: string,
    source: string,
    target: string
}

// export type WorkflowRunState = {
//   workflowId: string
//   status: "running" | "completed" | "failed"

//   nodeStates: Record<
//     string,
//     {
//       status: "pending" | "running" | "completed" | "failed"
//       output?: any
//     }
//   >
// }

export type NodeType =
  | "console.log"
  | "add.node"
  | "multiply.node"
  | "constant.node"


  export type NodeResult<T =  any> = {
    nodeId: string
    success: boolean
    output: T
    error?: string
    meta?: {
    startedAt: number
    finishedAt: number
  }
}


export type WorkflowContext = {
  results: Record<string, NodeResult>
}
