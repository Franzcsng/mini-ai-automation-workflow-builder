export async function consoleLogNode(node: any) {
  console.log(node.data.message)
  return {
    message: node.data.message
  }
}