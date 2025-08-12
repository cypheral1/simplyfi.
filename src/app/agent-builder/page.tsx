import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Plus, Workflow } from "lucide-react";

export default function AgentBuilderPage() {
  return (
    <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
      {/* Node Palette */}
      <aside className="w-72 border-r p-4 space-y-4 bg-card overflow-y-auto">
        <h2 className="text-lg font-semibold">AI Steps</h2>
        <div className="space-y-2">
            <Card className="p-3 cursor-grab hover:bg-accent">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Run Prompt</span>
              </div>
            </Card>
            <Card className="p-3 cursor-grab hover:bg-accent">
              <div className="flex items-center gap-3">
                <Workflow className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Use Tool</span>
              </div>
            </Card>
        </div>
      </aside>

      {/* Canvas Area */}
      <main className="flex-1 p-8 bg-muted/20 overflow-y-auto">
        <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <Plus className="mx-auto h-8 w-8" />
                <p>Drag AI steps here to build a workflow</p>
            </div>
        </div>
      </main>

      {/* Properties Panel */}
      <aside className="w-80 border-l p-4 bg-card overflow-y-auto">
         <Card className="sticky top-0">
            <CardHeader>
                <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
                <p>Select a step to see its properties.</p>
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}
