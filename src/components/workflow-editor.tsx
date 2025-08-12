"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflow-store';
import { AgentNode } from './agent-node';
import { StartNode } from './StartNode';
import { EndNode } from './EndNode';
import type { AgentNodeData } from '@/lib/types';

function WorkflowEditorComponent() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } = useWorkflowStore();
    const { screenToFlowPosition } = useReactFlow();

    const nodeTypes: NodeTypes = useMemo(() => ({ 
        agent: AgentNode,
        start: StartNode,
        end: EndNode,
    }), []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const dataString = event.dataTransfer.getData('application/json');

            if (typeof type === 'undefined' || !type || !dataString) {
                return;
            }
            
            const data = JSON.parse(dataString);

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            
            const newNode: Node<AgentNodeData> = {
                id: `${data.agentType || data.type}-${Date.now()}`,
                type,
                position,
                data
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node.id);
    }, [setSelectedNode]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);


    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
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
