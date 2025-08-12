import type { Edge, Node } from 'reactflow';
import type { AgentNodeData } from './types';

export const workflowTemplates: {
    name: string;
    description: string;
    workflow: {
        nodes: Node<AgentNodeData>[];
        edges: Edge[];
    };
}[] = [
    {
        name: 'Basic Code Generation',
        description: 'A simple workflow to generate code from a prompt.',
        workflow: {
            nodes: [
                {
                    id: '1',
                    type: 'agent',
                    position: { x: 250, y: 50 },
                    data: { agentType: 'code', label: 'Code Generator', description: 'Generates code from a prompt.' }
                }
            ],
            edges: []
        }
    },
    {
        name: 'Code Review and Refactor',
        description: 'Generate code, then have another agent review and refactor it.',
        workflow: {
            nodes: [
                {
                    id: '1',
                    type: 'agent',
                    position: { x: 100, y: 50 },
                    data: { agentType: 'code', label: 'Code Generator', description: 'Generates code from a prompt.' }
                },
                {
                    id: '2',
                    type: 'agent',
                    position: { x: 400, y: 50 },
                    data: { agentType: 'review', label: 'Code Reviewer', description: 'Reviews a piece of code.' }
                },
                {
                    id: '3',
                    type: 'agent',
                    position: { x: 250, y: 250 },
                    data: { agentType: 'refactor', label: 'Code Refactorer', description: 'Refactors a piece of code.' }
                }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true },
                { id: 'e2-3', source: '2', target: '3', animated: true },
            ]
        }
    },
    {
        name: 'Generate and Document',
        description: 'Generate code for an API client and then write documentation for it.',
        workflow: {
            nodes: [
                {
                    id: '1',
                    type: 'agent',
                    position: { x: 100, y: 50 },
                    data: { agentType: 'api_client', label: 'API Client Generator', description: 'Generates a client library for an API.' }
                },
                {
                    id: '2',
                    type: 'agent',
                    position: { x: 400, y: 50 },
                    data: { agentType: 'docs', label: 'Docs Writer', description: 'Writes documentation for the generated API client.' }
                }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', animated: true },
            ]
        }
    }
]
