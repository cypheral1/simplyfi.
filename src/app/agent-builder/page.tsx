
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Bot, Wand2, FileText, Play } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, UniqueIdentifier, closestCenter, PointerSensor, useSensor, useSensors, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const agentPalette = [
    { id: 'code-generator', title: "Code Generator", description: "Generates code from a prompt.", icon: <Code className="w-5 h-5" />, type: 'agent' },
    { id: 'ui-designer', title: "UI Designer", description: "Generates UI from a prompt.", icon: <Wand2 className="w-5 h-5" />, type: 'agent' },
    { id: 'docs-writer', title: "Docs Writer", description: "Writes documentation.", icon: <FileText className="w-5 h-5" />, type: 'agent' },
];

type Agent = {
  id: UniqueIdentifier;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

function DraggablePaletteItem({ agent }: { agent: Omit<Agent, 'id'> & {id: string} }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${agent.id}`,
    data: { agent, isPaletteItem: true }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab">
        <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4 p-3">
                <div className="p-2 bg-muted rounded-md">{agent.icon}</div>
                <div>
                    <CardTitle className="text-sm font-medium">{agent.title}</CardTitle>
                    <CardDescription className="text-xs">{agent.description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    </div>
  );
}

function SortableAgent({ agent }: { agent: Agent; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full max-w-xs mx-auto">
        <Card className="p-3 bg-card shadow-lg cursor-grab">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md">{agent.icon}</div>
              <div>
                  <CardTitle className="text-sm font-medium">{agent.title}</CardTitle>
                  <CardDescription className="text-xs">{agent.description}</CardDescription>
              </div>
          </div>
      </Card>
    </div>
  );
}

export default function AgentBuilderPage() {
  const [workflowAgents, setWorkflowAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: 'canvas-droppable',
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.isPaletteItem) {
        const { agent } = event.active.data.current;
        setActiveAgent({ ...agent, id: `instance-${Date.now()}` });
    } else {
        const activeId = event.active.id;
        const agent = workflowAgents.find(a => a.id === activeId);
        if(agent) setActiveAgent(agent);
    }
  }, [workflowAgents]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveAgent(null);
    const { active, over } = event;
  
    if (!over) return;
  
    const isPaletteItem = active.data.current?.isPaletteItem;
  
    if (isPaletteItem) {
      if (over.id === 'canvas-droppable' || findParent(over.id) === 'canvas-droppable') {
        const { agent } = active.data.current;
        const newAgent: Agent = { ...agent, id: `instance-${Date.now()}` };
        
        const overId = over.id;
        const overIndex = workflowAgents.findIndex(a => a.id === overId);

        if (overIndex !== -1) {
           setWorkflowAgents(prev => {
            const newAgents = [...prev];
            newAgents.splice(overIndex, 0, newAgent);
            return newAgents;
          });
        } else {
          setWorkflowAgents(prev => [...prev, newAgent]);
        }
      }
      return;
    }
  
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId !== overId) {
      setWorkflowAgents((agents) => {
        const oldIndex = agents.findIndex((a) => a.id === activeId);
        const newIndex = agents.findIndex((a) => a.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(agents, oldIndex, newIndex);
        }
        return agents;
      });
    }
  }, [workflowAgents]);

  const findParent = (id: UniqueIdentifier) => {
    if (id === 'canvas-droppable') {
      return 'canvas-droppable';
    }
    const agent = workflowAgents.find(a => a.id === id);
    if (agent) {
      return 'canvas-droppable';
    }
    return null;
  }
  
  if (!isClient) {
    return (
        <div className="flex h-[calc(100vh-4.1rem)] w-full items-center justify-center">
            <p>Loading Builder...</p>
        </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
        <aside className="w-80 border-r p-4 space-y-6 bg-card overflow-y-auto">
           <div>
             <div className="flex items-center gap-2 mb-2">
                <Play className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Run Workflow</h2>
             </div>
              <p className="text-sm text-muted-foreground mb-4">Enter a prompt and run the workflow on the canvas.</p>
              <Textarea placeholder="Enter the starting prompt for your workflow..." className="mb-4" />
              <Button className="w-full">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Run Workflow
              </Button>
           </div>
           <div className="border-t -mx-4"></div>
           <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Agent Palette</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Drag agents onto the canvas to build your workflow.</p>
              <div className="space-y-2">
                {agentPalette.map(agent => (
                  <DraggablePaletteItem key={agent.id} agent={agent} />
                ))}
              </div>
           </div>
        </aside>
        
        <main ref={setDroppableRef} id="canvas-droppable" className="flex-1 p-4 bg-dotted-pattern flex flex-col items-center justify-between">
            <Card className="p-3 bg-card shadow-md">
                <CardTitle className="text-base">Start</CardTitle>
            </Card>

            <div className="flex-1 w-full max-w-xs py-4">
                 {workflowAgents.length > 0 ? (
                    <SortableContext items={workflowAgents.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {workflowAgents.map(agent => (
                        <SortableAgent key={agent.id} agent={agent} />
                      ))}
                    </div>
                    </SortableContext>
                 ) : (
                    <div className="flex-1 flex items-center justify-center h-full">
                       <p className="text-muted-foreground">Drop agents here</p>
                    </div>
                 )}
            </div>
            
            <Card className="p-3 bg-card shadow-md">
                <CardTitle className="text-base">End</CardTitle>
            </Card>
        </main>
      </div>
     <DragOverlay>
        {activeAgent ? (
             <Card className="p-3 bg-card shadow-xl cursor-grabbing w-full max-w-xs">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md">{activeAgent.icon}</div>
                    <div>
                        <CardTitle className="text-sm font-medium">{activeAgent.title}</CardTitle>
                        <CardDescription className="text-xs">{activeAgent.description}</CardDescription>
                    </div>
                </div>
            </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
