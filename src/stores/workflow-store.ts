import { create } from 'zustand';
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import type { AgentNodeData } from '@/lib/types';

const initialNodes: Node<AgentNodeData>[] = [
    { id: 'start', type: 'start', position: { x: 350, y: 50 }, data: { label: 'Start' } },
    { id: 'end', type: 'end', position: { x: 350, y: 400 }, data: { label: 'End' } },
];

type WorkflowState = {
  nodes: Node<AgentNodeData>[];
  edges: Edge[];
  prompt: string;
  selectedNode: Node<AgentNodeData> | null;
};

type WorkflowActions = {
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node<AgentNodeData>) => void;
  updateNodeData: (nodeId: string, data: AgentNodeData) => void;
  setNodes: (nodes: Node<AgentNodeData>[], fitView?: boolean) => void;
  setEdges: (edges: Edge[]) => void;
  setPrompt: (prompt: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setNodeStatus: (nodeId: string, status: 'running' | 'success' | 'error') => void;
};

const useWorkflowStore = create<WorkflowState & WorkflowActions>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  prompt: '',
  selectedNode: null,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (node: Node<AgentNodeData>) => {
    set({ nodes: [...get().nodes, node] });
  },
  updateNodeData: (nodeId: string, data: AgentNodeData) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  setNodes: (nodes: Node<AgentNodeData>[]) => {
    set({ nodes });
  },
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },
  setPrompt: (prompt: string) => {
    set({ prompt });
  },
  setSelectedNode: (nodeId: string | null) => {
    const nodes = get().nodes;
    const node = nodes.find(n => n.id === nodeId) || null;
    if (node?.type === 'start' || node?.type === 'end') {
      set({ selectedNode: null });
    } else {
      set({ selectedNode: node });
    }
  },
  setNodeStatus: (nodeId: string, status: 'running' | 'success' | 'error') => {
      set({
        nodes: get().nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, status } };
          }
          return node;
        })
      });
  }
}));

export { useWorkflowStore };
