"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import type { AgentNodeData } from '@/lib/types';

export default function WorkflowPropertiesPanel() {
  const { selectedNode, updateNodeData } = useWorkflowStore();
  
  const { register, watch, reset } = useForm<AgentNodeData>({
    defaultValues: selectedNode?.data
  });

  useEffect(() => {
    if (selectedNode) {
      reset(selectedNode.data);
    }
  }, [selectedNode, reset]);
  
  useEffect(() => {
    const subscription = watch((value) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, value as AgentNodeData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, selectedNode, updateNodeData]);

  if (!selectedNode) {
    return (
      <Card className="m-4 h-full">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>Select a node to view its properties.</CardDescription>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground pt-10'>
          <p>No node selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4 h-full">
      <CardHeader>
        <CardTitle>Agent Properties</CardTitle>
        <CardDescription>Editing node: {selectedNode.data.label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input id="label" {...register('label')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={3} />
        </div>
         <div className="space-y-2">
          <Label>Agent Type</Label>
          <Input disabled value={selectedNode.data.agentType} />
        </div>
        {/* Add more fields for prompt, model, etc. later */}
      </CardContent>
    </Card>
  );
}
