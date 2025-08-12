
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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflow-store';
import { AgentNode } from './agent-node';
import type { AgentNodeData } from '@/lib/types';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

export default function WorkflowEditor() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId, selectedNodeId } = useWorkflowStore();
    const { screenToFlowPosition, getNodes } = useReactFlow();

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
                id: `${data.agentType}-${Date.now()}`,
                type,
                position,
                data
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, [setSelectedNodeId]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, [setSelectedNodeId])

    const handleDeleteNode = () => {
        if(selectedNodeId) {
            const newNodes = getNodes().filter(n => n.id !== selectedNodeId);
            onNodesChange(newNodes.map(n => ({id: n.id, type: 'remove'})));
            setSelectedNodeId(null);
        }
    }

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
             <Panel position="top-right">
                <Button variant="destructive" size="icon" onClick={handleDeleteNode} disabled={!selectedNodeId}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </Panel>
        </ReactFlow>
    );
}
