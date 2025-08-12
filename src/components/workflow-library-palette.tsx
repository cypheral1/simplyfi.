
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Library } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { workflowTemplates } from "@/lib/workflow-templates";
import { useToast } from "@/hooks/use-toast";

export default function WorkflowLibraryPalette() {
    const { setNodes, setEdges } = useWorkflowStore();
    const { toast } = useToast();

    const loadTemplate = (templateName: string) => {
        const template = workflowTemplates.find(t => t.name === templateName);
        if (template) {
            setNodes(template.workflow.nodes, true);
            setEdges(template.workflow.edges);
            toast({
                title: "Workflow Loaded",
                description: `The "${templateName}" workflow has been loaded onto the canvas.`
            })
        }
    };

    return (
        <div className="space-y-3">
            {workflowTemplates.map(template => (
                 <Card 
                    key={template.name} 
                    className="p-3 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                    onClick={() => loadTemplate(template.name)}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-md">
                            <Library className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                    </div>
                 </Card>
            ))}
        </div>
    )
}
