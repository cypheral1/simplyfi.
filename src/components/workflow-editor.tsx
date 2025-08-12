"use client";

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflow-store';
import { AgentNode } from './agent-node';
import type { AgentNodeData } from '@/lib/types';

function WorkflowEditorComponent() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useWorkflowStore();
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const nodeTypes: NodeTypes = useMemo(() => ({ 
        agent: AgentNode 
    }), []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const data = JSON.parse(event.dataTransfer.getData('application/json'));

            if (typeof type === 'undefined' || !type || !data) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            
            const newNode: Node<AgentNodeData> = {
                id: `${data.agentType}-${Date.now()}`,
                type,
                position,
                data
            };

            addNode(newNode);
        },
        [reactFlowInstance, addNode]
    );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
        >
            <Background />
            <Controls />
        </ReactFlow>
    );
}

export default function WorkflowEditor() {
    return (
        <ReactFlowProvider>
            <WorkflowEditorComponent />
        </ReactFlowProvider>
    )
}
