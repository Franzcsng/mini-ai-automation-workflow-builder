import Image from "next/image";
import {Button} from "@/components/ui/button"
import { runWorkflow, validateWorkflow } from "@/workflow/runner";
import workflow from "@/examples/simpleWorkflow.json";

export default async function Home() {
  validateWorkflow(workflow)
  await runWorkflow(workflow)


  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    
    </div>
  );
}
