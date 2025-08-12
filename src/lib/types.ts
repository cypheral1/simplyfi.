
import type { Node } from 'reactflow';

export type AgentNodeData = {
    agentType: string;
    label: string;
    description: string;
    status?: 'running' | 'success' | 'error';
    [key: string]: any;
};

export type AgentNode = Node<AgentNodeData>;
