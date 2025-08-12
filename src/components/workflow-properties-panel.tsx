
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import type { AgentNodeData } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';

export default function WorkflowPropertiesPanel() {
  const { selectedNode, updateNodeData } = useWorkflowStore();
  const { t } = useTranslation();
  
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
          <CardTitle>{t.workflow.properties.title}</CardTitle>
          <CardDescription>{t.workflow.properties.selectNode}</CardDescription>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground pt-10'>
          <p>{t.workflow.properties.noNodeSelected}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4 h-full">
      <CardHeader>
        <CardTitle>{t.workflow.properties.agentProperties}</CardTitle>
        <CardDescription>{t.workflow.properties.editingNode}: {selectedNode.data.label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">{t.workflow.properties.label}</Label>
          <Input id="label" {...register('label')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t.workflow.properties.description}</Label>
          <Textarea id="description" {...register('description')} rows={3} />
        </div>
         <div className="space-y-2">
          <Label>{t.workflow.properties.agentType}</Label>
          <Input disabled value={selectedNode.data.agentType} />
        </div>
      </CardContent>
    </Card>
  );
}
