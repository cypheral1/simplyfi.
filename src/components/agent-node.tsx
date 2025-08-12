"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AgentNodeData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileCode, Palette, Bot, LoaderCircle, CheckCircle, XCircle, Search, GitCommit, TestTube, Waypoints, Replace, ScanText, Image as ImageIcon } from 'lucide-react';

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
    image: <ImageIcon className="h-5 w-5" />,
    running: <LoaderCircle className="h-5 w-5 animate-spin" />,
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
};

const agentColors: Record<string, string> = {
    code: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    ui: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
    docs: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    review: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    refactor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    test: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    api_client: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    transform: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
    summarize: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    image: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    running: 'bg-blue-500/10 text-blue-500 border-blue-500/40',
    success: 'bg-green-500/10 text-green-500 border-green-500/40',
    error: 'bg-red-500/10 text-red-500 border-red-500/40',
    default: 'bg-muted text-muted-foreground border-border',
}

export const AgentNode = memo(({ data, isConnectable }: NodeProps<AgentNodeData>) => {
    
    const colorClass = agentColors[data.status || data.agentType] || agentColors.default;
    const icon = agentIcons[data.status || data.agentType] || agentIcons[data.agentType] || <Bot className="h-5 w-5" />;
    
    return (
        <Card className={cn("w-64 border-2 shadow-sm transition-all", colorClass)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
                <div className={cn("p-1.5 rounded-md", colorClass.replace('border-','').replace('/20', '/30'))}>
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
