"use client";

import { create } from 'zustand';
import {
    type Edge,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import type { AgentNodeData } from '@/lib/types';

type WorkflowState = {
    nodes: Node<AgentNodeData>[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    addNode: (node: Node<AgentNodeData>) => void;
    setNodes: (nodes: Node<AgentNodeData>[], fromTemplate?: boolean) => void;
    setEdges: (edges: Edge[]) => void;
    updateNodeStatus: (nodeId: string, status: AgentNodeData['status']) => void;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection) => {
        set({
            edges: addEdge({ ...connection, animated: true }, get().edges),
        });
    },
    addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
    },
    setNodes: (nodes, fromTemplate = false) => {
        if (fromTemplate) {
            set({ nodes });
            return;
        }
        set({ nodes: [...get().nodes, ...nodes]});
    },
    setEdges: (edges) => {
        set({ edges });
    },
    updateNodeStatus: (nodeId, status) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    // This creates a new data object to ensure React Flow detects the change
                    return { ...node, data: { ...node.data, status } };
                }
                return node;
            }),
        });
    },
}));
