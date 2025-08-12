"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Bot, FileCode, Palette, Search, GitCommit, TestTube, Waypoints, Replace, ScanText, Image as ImageIcon } from "lucide-react";
import type { AgentNodeData } from "@/lib/types";

const agentTypes: { agentType: string; label: string; description: string; icon: React.ReactNode }[] = [
    { agentType: 'code', label: 'Code Generator', description: 'Generates code from a prompt.', icon: <FileCode /> },
    { agentType: 'ui', label: 'UI Designer', description: 'Generates UI from a prompt.', icon: <Palette /> },
    { agentType: 'docs', label: 'Docs Writer', description: 'Writes documentation.', icon: <Bot /> },
    { agentType: 'review', label: 'Code Reviewer', description: 'Reviews a piece of code.', icon: <Search /> },
    { agentType: 'refactor', label: 'Code Refactorer', description: 'Refactors a piece of code.', icon: <GitCommit /> },
    { agentType: 'test', label: 'Test Generator', description: 'Generates unit tests for code.', icon: <TestTube /> },
    { agentType: 'api_client', label: 'API Client Generator', description: 'Generates a client library for an API.', icon: <Waypoints /> },
    { agentType: 'transform', label: 'Data Transformer', description: 'Transforms data from one format to another.', icon: <Replace /> },
    { agentType: 'summarize', label: 'Text Summarizer', description: 'Summarizes a long piece of text.', icon: <ScanText /> },
    { agentType: 'image', label: 'Image Generator', description: 'Generates an image from a prompt.', icon: <ImageIcon /> },
]

export default function WorkflowAgentPalette() {

    const onDragStart = (event: React.DragEvent, nodeType: string, data: Partial<AgentNodeData>) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/json', JSON.stringify(data));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="space-y-3">
            {agentTypes.map(agent => (
                 <Card 
                    key={agent.agentType} 
                    className="p-3 cursor-grab hover:shadow-md hover:border-primary/50 transition-all"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'agent', agent)}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-md">
                            {agent.icon}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{agent.label}</p>
                            <p className="text-xs text-muted-foreground">{agent.description}</p>
                        </div>
                    </div>
                 </Card>
            ))}
        </div>
    )
}
