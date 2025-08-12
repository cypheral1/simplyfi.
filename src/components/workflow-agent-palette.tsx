
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Bot, FileCode, Palette, Search, GitCommit, TestTube, Waypoints, Replace, ScanText, Image, PlayCircle, StopCircle, ShieldCheck, Database, Mail } from "lucide-react";

const nodeTypes = [
    { type: 'start', label: 'Start', description: 'The starting point of the workflow.', icon: <PlayCircle /> },
    { type: 'end', label: 'End', description: 'The ending point of the workflow.', icon: <StopCircle /> },
];

const agentTypes = [
    { agentType: 'code', label: 'Code Generator', description: 'Generates code from a prompt.', icon: <FileCode /> },
    { agentType: 'ui', label: 'UI Designer', description: 'Generates UI from a prompt.', icon: <Palette /> },
    { agentType: 'docs', label: 'Docs Writer', description: 'Writes documentation.', icon: <Bot /> },
    { agentType: 'review', label: 'Code Reviewer', description: 'Reviews a piece of code.', icon: <Search /> },
    { agentType: 'refactor', label: 'Code Refactorer', description: 'Refactors a piece of code.', icon: <GitCommit /> },
    { agentType: 'test', label: 'Test Generator', description: 'Generates unit tests for code.', icon: <TestTube /> },
    { agentType: 'api_client', label: 'API Client Generator', description: 'Generates a client library for an API.', icon: <Waypoints /> },
    { agentType: 'transform', label: 'Data Transformer', description: 'Transforms data from one format to another.', icon: <Replace /> },
    { agentType: 'summarize', label: 'Text Summarizer', description: 'Summarizes a long piece of text.', icon: <ScanText /> },
    { agentType: 'image', label: 'Image Generator', description: 'Generates an image from a prompt.', icon: <Image /> },
    { agentType: 'security', label: 'Security Auditor', description: 'Scans code for vulnerabilities.', icon: <ShieldCheck /> },
    { agentType: 'database', label: 'Database Designer', description: 'Generates a database schema.', icon: <Database /> },
    { agentType: 'email', label: 'Email Responder', description: 'Drafts email responses.', icon: <Mail /> },
]

export default function WorkflowAgentPalette() {

    const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
        const transferData = { 
            agentType: data.agentType,
            type: data.type,
            label: data.label,
            description: data.description,
        };

        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/json', JSON.stringify(transferData));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="space-y-3">
            {nodeTypes.map(node => {
                 const serializableData = {
                    type: node.type,
                    label: node.label,
                    description: node.description,
                 }
                 return (
                     <Card 
                        key={node.type} 
                        className="p-3 cursor-grab hover:shadow-md hover:border-primary/50 transition-all"
                        draggable
                        onDragStart={(event) => onDragStart(event, node.type, serializableData)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary p-2 rounded-md">
                                {node.icon}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{node.label}</p>
                                <p className="text-xs text-muted-foreground">{node.description}</p>
                            </div>
                        </div>
                     </Card>
                )
            })}

            <hr className="my-4" />

            {agentTypes.map(agent => {
                 const serializableAgent = {
                    agentType: agent.agentType,
                    label: agent.label,
                    description: agent.description
                 }
                 return (
                     <Card 
                        key={agent.agentType} 
                        className="p-3 cursor-grab hover:shadow-md hover:border-primary/50 transition-all"
                        draggable
                        onDragStart={(event) => onDragStart(event, 'agent', serializableAgent)}
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
                )
            })}
        </div>
    )
}
