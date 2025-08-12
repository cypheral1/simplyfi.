
import type { Node, Edge } from 'reactflow';
import type { AgentNodeData } from './types';

export const workflowTemplates: { name: string; description: string; workflow: { nodes: Node<AgentNodeData>[], edges: Edge[] } }[] = [
    {
        name: 'Basic Code Generation',
        description: 'A simple workflow to generate, review, and test code.',
        workflow: {
            nodes: [
                { id: '1', type: 'agent', position: { x: 250, y: 50 }, data: { agentType: 'code', label: 'Code Generator', description: 'Generates code from a prompt.' } },
                { id: '2', type: 'agent', position: { x: 250, y: 250 }, data: { agentType: 'review', label: 'Code Reviewer', description: 'Reviews a piece of code.' } },
                { id: '3', type: 'agent', position: { x: 250, y: 450 }, data: { agentType: 'test', label: 'Test Generator', description: 'Generates unit tests for code.' } },
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true },
                { id: 'e2-3', source: '2', target: '3', animated: true },
            ]
        }
    },
    {
        name: 'UI & Docs Workflow',
        description: 'Generate UI components and then write documentation for them.',
        workflow: {
            nodes: [
                { id: '1', type: 'agent', position: { x: 100, y: 100 }, data: { agentType: 'ui', label: 'UI Designer', description: 'Generates UI from a prompt.' } },
                { id: '2', type: 'agent', position: { x: 400, y: 100 }, data: { agentType: 'docs', label: 'Docs Writer', description: 'Writes documentation.' } },
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true },
            ]
        }
    }
]
