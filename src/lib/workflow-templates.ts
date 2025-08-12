import type { Node, Edge } from 'reactflow';
import type { AgentNodeData } from './types';

export const workflowTemplates: { name: string; description: string; workflow: { nodes: Node<AgentNodeData>[], edges: Edge[] } }[] = [
    {
        name: 'Basic Code Generation',
        description: 'A simple workflow to generate, review, and test code.',
        workflow: {
            nodes: [
                { id: 'start', type: 'start', position: { x: 350, y: 25 }, data: { label: 'Start' } },
                { id: 'code-gen', type: 'agent', position: { x: 250, y: 150 }, data: { agentType: 'code', label: 'Code Generator', description: 'Generates code from a prompt.' } },
                { id: 'review', type: 'agent', position: { x: 250, y: 350 }, data: { agentType: 'review', label: 'Code Reviewer', description: 'Reviews a piece of code.' } },
                { id: 'test-gen', type: 'agent', position: { x: 250, y: 550 }, data: { agentType: 'test', label: 'Test Generator', description: 'Generates unit tests for code.' } },
                { id: 'end', type: 'end', position: { x: 350, y: 750 }, data: { label: 'End' } },
            ],
            edges: [
                { id: 'e-start-code', source: 'start', target: 'code-gen', animated: true },
                { id: 'e-code-review', source: 'code-gen', target: 'review', animated: true },
                { id: 'e-review-test', source: 'review', target: 'test-gen', animated: true },
                { id: 'e-test-end', source: 'test-gen', target: 'end', animated: true },
            ]
        }
    },
    {
        name: 'UI & Docs Workflow',
        description: 'Generate UI components and then write documentation for them.',
        workflow: {
            nodes: [
                { id: 'start', type: 'start', position: { x: 350, y: 25 }, data: { label: 'Start' } },
                { id: 'ui-design', type: 'agent', position: { x: 100, y: 150 }, data: { agentType: 'ui', label: 'UI Designer', description: 'Generates UI from a prompt.' } },
                { id: 'docs-write', type: 'agent', position: { x: 400, y: 150 }, data: { agentType: 'docs', label: 'Docs Writer', description: 'Writes documentation.' } },
                { id: 'end', type: 'end', position: { x: 350, y: 300 }, data: { label: 'End' } },
            ],
            edges: [
                { id: 'e-start-ui', source: 'start', target: 'ui-design', animated: true },
                { id: 'e-ui-docs', source: 'ui-design', target: 'docs-write', animated: true },
                { id: 'e-docs-end', source: 'docs-write', target: 'end', animated: true },
            ]
        }
    },
    {
        name: 'Code Refactor & Test',
        description: 'A workflow to refactor code and then generate unit tests.',
        workflow: {
            nodes: [
                { id: 'start', type: 'start', position: { x: 350, y: 25 }, data: { label: 'Start' } },
                { id: 'refactor', type: 'agent', position: { x: 250, y: 150 }, data: { agentType: 'refactor', label: 'Code Refactorer', description: 'Refactors a piece of code.' } },
                { id: 'test', type: 'agent', position: { x: 250, y: 350 }, data: { agentType: 'test', label: 'Test Generator', description: 'Generates unit tests for code.' } },
                { id: 'end', type: 'end', position: { x: 350, y: 550 }, data: { label: 'End' } },
            ],
            edges: [
                { id: 'e-start-refactor', source: 'start', target: 'refactor', animated: true },
                { id: 'e-refactor-test', source: 'refactor', target: 'test', animated: true },
                { id: 'e-test-end', source: 'test', target: 'end', animated: true },
            ]
        }
    },
    {
        name: 'API Client Generation',
        description: 'Generates a client library for a given API specification.',
        workflow: {
            nodes: [
                { id: 'start', type: 'start', position: { x: 350, y: 25 }, data: { label: 'Start' } },
                { id: 'api-client', type: 'agent', position: { x: 250, y: 150 }, data: { agentType: 'api_client', label: 'API Client Generator', description: 'Generates a client for an API.' } },
                { id: 'end', type: 'end', position: { x: 350, y: 350 }, data: { label: 'End' } },
            ],
            edges: [
                { id: 'e-start-api', source: 'start', target: 'api-client', animated: true },
                { id: 'e-api-end', source: 'api-client', target: 'end', animated: true },
            ]
        }
    },
    {
        name: 'Image and Summary',
        description: 'Generate an image and then write a summary for it.',
        workflow: {
            nodes: [
                { id: 'start', type: 'start', position: { x: 350, y: 25 }, data: { label: 'Start' } },
                { id: 'image-gen', type: 'agent', position: { x: 100, y: 150 }, data: { agentType: 'image', label: 'Image Generator', description: 'Generates an image from a prompt.' } },
                { id: 'summarize', type: 'agent', position: { x: 400, y: 150 }, data: { agentType: 'summarize', label: 'Text Summarizer', description: 'Summarizes a long piece of text.' } },
                { id: 'end', type: 'end', position: { x: 350, y: 300 }, data: { label: 'End' } },
            ],
            edges: [
                { id: 'e-start-image', source: 'start', target: 'image-gen', animated: true },
                { id: 'e-image-summarize', source: 'image-gen', target: 'summarize', animated: true },
                { id: 'e-summarize-end', source: 'summarize', target: 'end', animated: true },
            ]
        }
    }
]
