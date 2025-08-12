"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Library } from 'lucide-react';
import WorkflowAgentPalette from './workflow-agent-palette';
import WorkflowLibraryPalette from './workflow-library-palette';
import WorkflowEditor from './workflow-editor';
import { ScrollArea } from './ui/scroll-area';

export default function WorkflowView() {
    return (
        <div className="flex h-[calc(100vh-4.1rem)]">
            <aside className="w-96 border-r bg-background p-4">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Workflow Builder</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Tabs defaultValue="agents">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="agents"><Bot className="mr-2 h-4 w-4" /> Agents</TabsTrigger>
                                <TabsTrigger value="library"><Library className="mr-2 h-4 w-4" /> Library</TabsTrigger>
                            </TabsList>
                            <ScrollArea className="h-[calc(100vh-14rem)] mt-4 pr-3">
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
    );
}
