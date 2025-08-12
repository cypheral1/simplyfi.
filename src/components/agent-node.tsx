
"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AgentNodeData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileCode, Palette, Bot, Search, GitCommit, TestTube, Waypoints, Replace, ScanText, Image as ImageI, LoaderCircle, CheckCircle, XCircle } from 'lucide-react';

const agentIcons: Record<string, React.ReactNode> = {
    code: <FileCode className="h-5 w-5" />,
    ui: <Palette className="h-5 w-5" />,
    docs: <Bot className="h-5 w-5" />,
    review: <Search className="h-5 w-5" />,
    refactor: <GitCommit className="h-5 w-5" />,
    test: <TestTube className="h-5 w-5" />,
    api_client: <Waypoints className="h-5 w-5" />,
    transform: <Replace className="h-5 w-5" />,
    summarize: <ScanText className="h-5 w-5" />,
    image: <ImageI className="h-5 w-5" />,
    running: <LoaderCircle className="h-5 w-5 animate-spin" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
};

const agentColors: Record<string, string> = {
    running: 'border-blue-500/80 shadow-blue-500/50',
    success: 'border-green-500/80 shadow-green-500/50',
    error: 'border-red-500/80 shadow-red-500/50',
    default: 'border-border',
}

export const AgentNode = memo(({ data, isConnectable, selected }: NodeProps<AgentNodeData>) => {
    
    const colorClass = agentColors[data.status || 'default'] || agentColors.default;
    const icon = agentIcons[data.status || 'default'] || agentIcons[data.agentType];
    
    return (
        <Card className={cn(
            "w-64 border-2 shadow-sm transition-all", 
            colorClass,
            selected && "ring-2 ring-primary ring-offset-2"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
                <div className={cn("p-1.5 rounded-md text-muted-foreground")}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{data.description}</p>
            </CardContent>
            <Handle
                type="target"
                position={Position.Top}
                id="a"
                isConnectable={isConnectable}
                className="!bg-primary"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="b"
                isConnectable={isConnectable}
                className="!bg-primary"
            />
        </Card>
    );
});

AgentNode.displayName = "AgentNode";
