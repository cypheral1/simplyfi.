
"use client";

import React from 'react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export default function WorkflowPropertiesPanel() {
    const { nodes, selectedNodeId, updateNodeData } = useWorkflowStore();
    
    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    if (!selectedNode) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a node to see its properties</p>
            </div>
        )
    }

    const handleDataChange = (key: string, value: string) => {
        updateNodeData(selectedNode.id, { [key]: value });
    };

    return (
        <Card className="h-full border-0 shadow-none">
            <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Edit the properties of the selected agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className='space-y-2'>
                    <Label htmlFor="node-label">Label</Label>
                    <Input 
                        id="node-label" 
                        value={selectedNode.data.label} 
                        onChange={(e) => handleDataChange('label', e.target.value)} 
                    />
                </div>
                 <div className='space-y-2'>
                    <Label htmlFor="node-desc">Description</Label>
                    <Textarea 
                        id="node-desc"
                        value={selectedNode.data.description}
                        onChange={(e) => handleDataChange('description', e.target.value)}
                        rows={5}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
