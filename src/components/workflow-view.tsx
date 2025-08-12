
"use client";

import React, { useState, useTransition } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Library, Play, Loader2 } from 'lucide-react';
import WorkflowAgentPalette from './workflow-agent-palette';
import WorkflowLibraryPalette from './workflow-library-palette';
import WorkflowEditor from './workflow-editor';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { executeWorkflowAction } from '@/app/ai-workflows/actions';
import { useToast } from '@/hooks/use-toast';
import type { Node as ReactFlowNode } from 'reactflow';

export default function WorkflowView() {
    const { nodes, edges, updateNodeStatus } = useWorkflowStore();
    const [prompt, setPrompt] = useState('');
    const [isExecuting, startExecution] = useTransition();
    const { toast } = useToast();

    const handleRunWorkflow = () => {
        if (!prompt.trim()) {
            toast({
                title: "Prompt is required",
                description: "Please enter a prompt to start the workflow.",
                variant: "destructive"
            });
            return;
        }

        startExecution(async () => {
            let sortedNodes: ReactFlowNode[] = [];
            if (edges.length > 0) {
                 const nodeMap = new Map(nodes.map(n => [n.id, n]));
                 const edgeMap = new Map(edges.map(e => [e.source, e]));
                 let currentNodeId = edges[0].source;
                 while(currentNodeId && sortedNodes.length < nodes.length) {
                    const node = nodeMap.get(currentNodeId);
                    if (node) {
                        sortedNodes.push(node);
                        const nextEdge = edgeMap.get(currentNodeId);
                        currentNodeId = nextEdge ? nextEdge.target : '';
                    } else { break; }
                }
            } else if (nodes.length > 0) {
                sortedNodes = [nodes[0]];
            }


            for (const node of sortedNodes) {
                updateNodeStatus(node.id, 'running');
                await new Promise(resolve => setTimeout(resolve, 1000));
                updateNodeStatus(node.id, 'success');
            }

            const result = await executeWorkflowAction({ prompt, nodes, edges });

            if(result.success) {
                toast({
                    title: "Workflow Complete",
                    description: "The workflow has finished executing successfully."
                });
                console.log("Execution Log:", result.log);
            } else {
                toast({
                    title: "Workflow Failed",
                    description: result.error,
                    variant: "destructive"
                });
                nodes.forEach(node => {
                    if (node.data.status === 'running') {
                         updateNodeStatus(node.id, 'error');
                    }
                })
            }
        });
    }

    return (
        <ReactFlowProvider>
            <div className="flex h-[calc(100vh-4.1rem)]">
                <aside className="w-96 border-r bg-background p-4 flex flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Run Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea 
                                placeholder="Enter your prompt here..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                            />
                            <Button onClick={handleRunWorkflow} disabled={isExecuting || nodes.length === 0} className="w-full">
                                {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                {isExecuting ? 'Executing...' : 'Run Workflow'}
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="h-full flex-1">
                        <CardContent className="p-4 h-full">
                           <Tabs defaultValue="agents" className="h-full flex flex-col">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="agents"><Bot className="mr-2 h-4 w-4" /> Agents</TabsTrigger>
                                    <TabsTrigger value="library"><Library className="mr-2 h-4 w-4" /> Library</TabsTrigger>
                                </TabsList>
                                <ScrollArea className="flex-1 mt-4 pr-3">
                                    <TabsContent value="agents">
                                        <WorkflowAgentPalette />
                                    </TabsContent>
                                    <TabsContent value="library">
                                        <WorkflowLibraryPalette />
                                    </TabsContent>
                                </ScrollArea>
                           </Tabs>
                        </CardContent>
                    </Card>
                </aside>
                <main className="flex-1 bg-muted/30">
                    <WorkflowEditor />
                </main>
            </div>
        </ReactFlowProvider>
    );
}
