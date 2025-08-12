
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Bot, Wand2, FileText, Play, GripVertical, Trash2 } from "lucide-react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  UniqueIdentifier,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarGroup, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';

const agentPalette = [
    { id: 'start', title: "Start", description: "The starting point of the workflow", icon: <Play className="w-5 h-5 text-green-500" />, color: 'bg-green-500/10' },
    { id: 'prompt', title: "Run Prompt", description: "Executes an AI prompt.", icon: <Bot className="w-5 h-5 text-blue-500" />, color: 'bg-blue-500/10' },
    { id: 'tool', title: "Use Tool", description: "Calls a predefined tool.", icon: <Wand2 className="w-5 h-5 text-purple-500" />, color: 'bg-purple-500/10' },
    { id: 'condition', title: "Condition", description: "Branch based on a condition.", icon: <Code className="w-5 h-5 text-orange-500" />, color: 'bg-orange-500/10' },
];

type Agent = {
  id: UniqueIdentifier;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  props?: { [key: string]: any };
};

const initialProps: { [key: string]: any } = {
  start: { prompt: '' },
  prompt: { prompt: 'Generate a function that...' },
  tool: { name: 'getWeather' },
  condition: { condition: 'if (x > 10)' },
};

function DraggablePaletteItem({ step }: { step: Omit<Agent, 'id' | 'props'> & {id: string} }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${step.id}`,
    data: { step, isPaletteItem: true }
  });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>
      <Card className={cn('p-3 cursor-grab hover:shadow-md transition-shadow', step.color)}>
          <div className="flex flex-col items-center text-center gap-2">
              {step.icon}
              <CardTitle className="text-sm font-medium">{step.title}</CardTitle>
          </div>
      </Card>
    </div>
  );
}

function SortableAgent({ agent, isSelected, onSelect, onRemove }: { agent: Agent; isSelected: boolean, onSelect: (id: UniqueIdentifier) => void, onRemove: (id: UniqueIdentifier) => void }) {
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn("w-full max-w-sm mx-auto relative group", isSelected && "ring-2 ring-primary ring-offset-2 rounded-lg bg-primary/5",)}
      onClick={() => onSelect(agent.id)}
    >
        <Card className={cn("p-4 bg-card shadow-md border-2", isSelected ? 'border-primary' : 'border-transparent')}>
          <div className="flex items-center gap-4">
              <div {...attributes} {...listeners} className="p-2 cursor-grab text-muted-foreground hover:bg-accent rounded-md">
                <GripVertical className="w-5 h-5 " />
              </div>
              <div className="p-2 bg-muted rounded-md">{agent.icon}</div>
              <div className="flex-1">
                  <CardTitle className="text-sm font-medium">{agent.title}</CardTitle>
                  <CardDescription className="text-xs">{agent.description}</CardDescription>
              </div>
          </div>
      </Card>
      <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onRemove(agent.id)}}>
          <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}

function PropertiesPanel({ agent, onUpdate }: { agent: Agent | null, onUpdate: (id: UniqueIdentifier, newProps: any) => void }) {
    const form = useForm();
    
    useEffect(() => {
        if (agent) {
            form.reset(agent.props);
        }
    }, [agent, form]);

    if (!agent) {
        return (
            <Card className="sticky top-4">
                <CardHeader>
                    <CardTitle>Properties</CardTitle>
                    <CardDescription>Select a step to configure it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No step selected.</p>
                </CardContent>
            </Card>
        );
    }
    
    const onSubmit = (data: any) => {
        onUpdate(agent.id, data);
    };

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>{agent.title}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onBlur={form.handleSubmit(onSubmit)} className="space-y-6">
                       {Object.keys(initialProps[agent.type] || {}).map(propName => (
                           <FormField
                                key={propName}
                                control={form.control}
                                name={propName}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="capitalize">{propName}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={`Enter ${propName}...`} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                           />
                       ))}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default function AgentBuilderPage() {
  const [workflowAgents, setWorkflowAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<UniqueIdentifier | null>(null);
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
  
  const handleSelectAgent = (id: UniqueIdentifier) => setSelectedAgentId(id);

  const handleRemoveAgent = (id: UniqueIdentifier) => {
    setWorkflowAgents(agents => agents.filter(a => a.id !== id));
    if (selectedAgentId === id) {
        setSelectedAgentId(null);
    }
  }

  const handleUpdateAgent = (id: UniqueIdentifier, props: any) => {
      setWorkflowAgents(agents => agents.map(a => a.id === id ? {...a, props} : a));
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.isPaletteItem) {
        const { step } = event.active.data.current;
        const newId = `instance-${Date.now()}`;
        setActiveAgent({ ...step, id: newId, props: initialProps[step.id] || {} });
    } else {
        const agent = workflowAgents.find(a => a.id === event.active.id);
        if (agent) setActiveAgent(agent);
    }
  }, [workflowAgents]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveAgent(null);
    const { active, over } = event;
  
    if (!over) return;
  
    const isPaletteItem = active.data.current?.isPaletteItem;
  
    // Handle dropping a new item from the palette
    if (isPaletteItem && activeAgent) {
        setWorkflowAgents(prev => {
            const overId = over.id;
            // Case 1: Dropping on the main canvas (empty or not)
            if (overId === 'canvas-droppable') {
                return [...prev, activeAgent];
            }

            // Case 2: Dropping over an existing agent on the canvas
            const overAgentIndex = prev.findIndex(a => a.id === overId);
            if (overAgentIndex !== -1) {
                const newAgents = [...prev];
                newAgents.splice(overAgentIndex, 0, activeAgent);
                return newAgents;
            }
            
            // Fallback for safety, though should be covered by above cases
            return [...prev, activeAgent];
        });
        setSelectedAgentId(activeAgent.id);
        return;
    }
  
    // Handle reordering an existing item on the canvas
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId !== overId) {
      setWorkflowAgents((agents) => {
        const oldIndex = agents.findIndex((a) => a.id === activeId);
        const newIndex = agents.findIndex((a) => a.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const movedAgents = arrayMove(agents, oldIndex, newIndex);
          // After moving, keep the item selected
          setTimeout(() => setSelectedAgentId(activeId), 0);
          return movedAgents;
        }
        return agents;
      });
    }
  }, [activeAgent]);
  
  if (!isClient) {
    return (
        <div className="flex h-[calc(100vh-4.1rem)] w-full items-center justify-center">
            <p>Loading Builder...</p>
        </div>
    );
  }

  const selectedAgent = workflowAgents.find(a => a.id === selectedAgentId) || null;

  return (
    <SidebarProvider>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center justify-between p-2">
                        <CardTitle>AI Agents</CardTitle>
                        <SidebarTrigger />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <div className="grid grid-cols-2 gap-2">
                            {agentPalette.map(step => (
                                <DraggablePaletteItem key={step.id} step={step} />
                            ))}
                        </div>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
          
          {/* Center Canvas */}
          <SidebarInset className="flex-1">
            <main ref={setDroppableRef} id="canvas-droppable" className="flex-1 p-8 bg-dotted-pattern flex flex-col items-center overflow-y-auto h-full">
                <div className="w-full max-w-sm py-4 space-y-6">
                     {workflowAgents.length > 0 ? (
                        <SortableContext items={workflowAgents.map(a => a.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                          {workflowAgents.map(agent => (
                            <SortableAgent 
                                key={agent.id} 
                                agent={agent} 
                                isSelected={selectedAgentId === agent.id}
                                onSelect={handleSelectAgent}
                                onRemove={handleRemoveAgent}
                            />
                          ))}
                        </div>
                        </SortableContext>
                     ) : (
                        <div className="flex-1 flex items-center justify-center h-full mt-40">
                           <div className="text-center p-8 border-2 border-dashed rounded-xl">
                              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="mt-4 text-muted-foreground">Drag agent steps here to start</p>
                           </div>
                        </div>
                     )}
                </div>
            </main>
          </SidebarInset>
          
           {/* Right Panel */}
           <aside className="w-[400px] border-l p-4 space-y-6 bg-card overflow-y-auto">
               <PropertiesPanel agent={selectedAgent} onUpdate={handleUpdateAgent} />
          </aside>
        </div>
       <DragOverlay>
          {activeAgent ? (
               <Card className={cn("p-4 bg-card shadow-xl cursor-grabbing w-full max-w-sm", activeAgent.color)}>
                   <div className="flex items-center gap-4">
                      <div className="p-2 cursor-grab text-muted-foreground"><GripVertical className="w-5 h-5" /></div>
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
    </SidebarProvider>
  );
}

    

    