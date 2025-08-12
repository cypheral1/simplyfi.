
"use client";

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
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
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

export default function WorkflowView() {
    const { nodes, edges, prompt, setPrompt, setNodeStatus } = useWorkflowStore();
    const { toast } = useToast();
    const [isExecuting, setIsExecuting] = React.useState(false);
    const { t } = useTranslation();

    const handleExecute = async () => {
        setIsExecuting(true);
        toast({
            title: t.workflow.execution.started,
            description: t.workflow.execution.running,
        });

        const workflow = { nodes, edges };

        try {
            nodes.forEach(node => setNodeStatus(node.id, 'running'));
            
            const result = await executeWorkflowAction({ workflow, prompt });

            if (result.success && result.log) {
                 result.log.forEach((logEntry, index) => {
                    setTimeout(() => {
                        setNodeStatus(logEntry.nodeId, logEntry.status);
                    }, index * 500);
                });
                toast({
                    title: t.workflow.execution.success,
                    description: t.workflow.execution.completed,
                });
            } else {
                 nodes.forEach(node => setNodeStatus(node.id, 'error'));
                 toast({
                    title: t.workflow.execution.failed,
                    description: result.error || t.workflow.execution.unknownError,
                    variant: "destructive",
                });
            }
        } catch (error: any) {
             nodes.forEach(node => setNodeStatus(node.id, 'error'));
             toast({
                title: t.workflow.execution.error,
                description: error.message || t.workflow.execution.criticalError,
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
                        placeholder={t.workflow.promptPlaceholder}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className='h-24'
                    />
                    <Button onClick={handleExecute} disabled={isExecuting} className='w-full'>
                        <Play className="mr-2 h-4 w-4" />
                        {isExecuting ? t.workflow.executing : t.workflow.run}
                    </Button>
                </div>

                <Tabs defaultValue="agents" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="agents">{t.workflow.tabs.agents}</TabsTrigger>
                        <TabsTrigger value="library">{t.workflow.tabs.library}</TabsTrigger>
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
