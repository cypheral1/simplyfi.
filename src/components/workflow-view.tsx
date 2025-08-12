"use client";

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowEditor from '@/components/workflow-editor';
import WorkflowAgentPalette from '@/components/workflow-agent-palette';
import WorkflowLibraryPalette from '@/components/workflow-library-palette';
import WorkflowPropertiesPanel from './workflow-properties-panel';
import { Button } from './ui/button';
import { Play } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useWorkflowStore } from '@/stores/workflow-store';
import { executeWorkflowAction } from '@/app/ai-workflows/actions';
import { useToast } from './ui/use-toast';

export default function WorkflowView() {
    const { nodes, edges, prompt, setPrompt, setNodeStatus } = useWorkflowStore();
    const { toast } = useToast();
    const [isExecuting, setIsExecuting] = React.useState(false);

    const handleExecute = async () => {
        setIsExecuting(true);
        toast({
            title: "Workflow Execution Started",
            description: "The AI agents are now running.",
        });

        const workflow = { nodes, edges };

        try {
            // Set all nodes to 'running' for visual feedback
            nodes.forEach(node => setNodeStatus(node.id, 'running'));
            
            const result = await executeWorkflowAction({ workflow, prompt });

            if (result.success && result.log) {
                 result.log.forEach((logEntry, index) => {
                    setTimeout(() => {
                        setNodeStatus(logEntry.nodeId, logEntry.status);
                    }, index * 500); // Stagger status updates
                });
                toast({
                    title: "Workflow Execution Successful",
                    description: "The workflow has completed.",
                });
            } else {
                 nodes.forEach(node => setNodeStatus(node.id, 'error'));
                 toast({
                    title: "Workflow Execution Failed",
                    description: result.error || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
             nodes.forEach(node => setNodeStatus(node.id, 'error'));
             toast({
                title: "Workflow Execution Error",
                description: error.message || "A critical error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsExecuting(false);
        }
    };


    return (
        <div className="flex h-[calc(100vh-4.1rem)]">
            <aside className="w-80 border-r p-4 space-y-4 overflow-y-auto">
                <div className='space-y-2'>
                    <Textarea 
                        placeholder="Enter your initial prompt..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className='h-24'
                    />
                    <Button onClick={handleExecute} disabled={isExecuting} className='w-full'>
                        <Play className="mr-2 h-4 w-4" />
                        {isExecuting ? "Executing..." : "Run Workflow"}
                    </Button>
                </div>

                <Tabs defaultValue="agents" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                        <TabsTrigger value="library">Library</TabsTrigger>
                    </TabsList>
                    <TabsContent value="agents" className="pt-2">
                         <WorkflowAgentPalette />
                    </TabsContent>
                    <TabsContent value="library" className="pt-2">
                        <WorkflowLibraryPalette />
                    </TabsContent>
                </Tabs>
            </aside>
            <main className="flex-1 flex">
                <div className="flex-1 w-2/3 border-r">
                     <ReactFlowProvider>
                        <WorkflowEditor />
                    </ReactFlowProvider>
                </div>
                <aside className='w-1/3'>
                    <WorkflowPropertiesPanel />
                </aside>
            </main>
        </div>
    );
}
