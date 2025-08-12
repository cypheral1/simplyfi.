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
    selectedNodeId: string | null;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    addNode: (node: Node<AgentNodeData>) => void;
    setNodes: (nodes: Node<AgentNodeData>[], fromTemplate?: boolean) => void;
    setEdges: (edges: Edge[]) => void;
    updateNodeStatus: (nodeId: string, status: AgentNodeData['status']) => void;
    setSelectedNodeId: (nodeId: string | null) => void;
    updateNodeData: (nodeId: string, data: Partial<AgentNodeData>) => void;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
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
                    return { ...node, data: { ...node.data, status } };
                }
                return node;
            }),
        });
    },
    setSelectedNodeId: (nodeId) => {
        set({ selectedNodeId: nodeId });
    },
    updateNodeData: (nodeId, data) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        })
    }
}));
