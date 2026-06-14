# mini-ai-automation-workflow-builder
A personal project to dive deeper to AI automation systems. A mini-zapier/n8n AI workflow maker.



# Workflow Functions:

# Validation:
- validateUniqueNodeIds(): Checks that alll workflow nodes are unique and have no duplicates
- validateEdges(): validates that source and target nodes in workflow edges exist in the workflow nodes
- validateNodeTypes(): validates that each node existing in the workflow exists in the node registry
- validateInputReferences(): checks required dependency inputs of a node are of its dependency nodes.
- validateWorkflowCycle(): checks if workflow has cyclic node connections with Depth First Search (DFS) algorithm.
- validateWorkflow(): validates workflow with the aforementioned validation functions.

# Workflow Helpers:
- buildDependencyMap(): Build record of node dependencies for each node. 
    Sample output: {`{"A": [], "B": ["A"]}`}
- resolveInputs(): Processes node dependency inputs into an array of resolved values.
    Sample output: {`{a: "value1", b: 2}`} 
- resolvePath(): Helper for resolveInputs function. Processes each input dependency paths to their values. 
    Sample path: nodeId.output.value
    Sample output: 2 
- topologicalSort(): Creates a grid of execution layers that allows for concurrent executions of nodes per layer. Checks if Node has zero depencies, and processes that node.
    sampleOutput: {`[["node1"], ["node2", "node3"], ["node4"]]`}
- topologicalSortHelper(): Removes processed/sorted nodes from the dependency map which allows the topologicalSort function to decide which nodes gets pushed into an execution layer.
- runWithConcurrencyLimit(): Executes nodes concurrently (allows for parallel execution) with worker limits to avoid overloading. 
- executeWithRetry(): Allows retries for node execution failures. Accepts attempts and delayMs parameters.
- executeWithTimeout(): Execute nodes with timeout, but currently does not have abortController.

-canExecute(): checks node dependencies and conditions are met. If yes, returns true.