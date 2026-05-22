export type workflow = {
    id: string,
    nodes: workflowNode[],
    edges: workflowEdges[],
    version: string
}

export type workflowNode = {
    id: string,
    type: string,
    data: Record<string, any>
}


export type workflowEdges = {
    id: string,
    source: string,
    target: string
}

export type WorkflowRunState = {
  workflowId: string
  status: "running" | "completed" | "failed"

  nodeStates: Record<
    string,
    {
      status: "pending" | "running" | "completed" | "failed"
      output?: any
    }
  >
}


export type NodeType =
  | "console.log"
  | "ai.summarize"
  | "http.request"