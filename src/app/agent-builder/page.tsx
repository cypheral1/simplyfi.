
"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Plus, Workflow, MessagesSquare, Code, Settings2, Folder, FileText, LifeBuoy, Search, GripVertical } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, UniqueIdentifier, closestCenter, PointerSensor, useSensor, useSensors, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

const workflowTemplates = [
    { title: "Customer Support Bot", description: "Automatically answer customer questions.", icon: <MessagesSquare className="w-5 h-5" /> },
    { title: "Content Generation", description: "Generate blog posts or marketing copy.", icon: <FileText className="w-5 h-5" /> },
    { title: "Code Assistant", description: "Help developers write and debug code.", icon: <Code className="w-5 h-5" /> },
];

const aiStepsPalette = [
    { id: 'start', title: "Start Trigger", description: "Define how the workflow starts (e.g., API call, schedule).", icon: <Bot className="w-8 h-8 text-primary" />, color: "bg-green-100 dark:bg-green-900/30" },
    { id: 'prompt', title: "Run Prompt", description: "Generate text with a specified model and prompt.", icon: <FileText className="w-8 h-8 text-primary" />, color: "bg-blue-100 dark:bg-blue-900/30" },
    { id: 'tool', title: "Use Tool", description: "Integrate with external APIs or services.", icon: <Workflow className="w-8 h-8 text-primary" />, color: "bg-yellow-100 dark:bg-yellow-900/30" },
    { id: 'conditional', title: "Conditional Logic", description: "Branch the workflow based on conditions.", icon: <Settings2 className="w-8 h-8 text-primary" />, color: "bg-purple-100 dark:bg-purple-900/30" },
];

type WorkflowStepType = {
  id: UniqueIdentifier;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

function DraggablePaletteItem({ step }: { step: Omit<WorkflowStepType, 'id'> & {id: string} }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${step.id}`,
    data: { step, isPaletteItem: true }
  });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>
      <Card className={`p-3 cursor-grab hover:shadow-md transition-shadow ${step.color}`}>
          <div className="flex flex-col items-center text-center gap-2">
              {step.icon}
              <span className="font-semibold text-sm">{step.title}</span>
              <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
      </Card>
    </div>
  );
}

function SortableWorkflowStep({ step, onRemove, onSelect, isSelected }: { step: WorkflowStepType; onRemove: (id: UniqueIdentifier) => void; onSelect: (id: UniqueIdentifier) => void; isSelected: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="w-full max-w-sm mx-auto" onClick={() => onSelect(step.id)}>
        <Card className={cn("p-4 bg-card relative group transition-all", isSelected ? "border-primary shadow-lg" : "border-transparent")}>
          <div {...attributes} {...listeners} className="cursor-grab absolute top-2 left-2 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${step.color}`}>{step.icon}</div>
              <div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription className="text-sm">{step.description}</CardDescription>
              </div>
          </div>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-50 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onRemove(step.id); }}>
              <Plus className="h-4 w-4 rotate-45 text-destructive" />
          </Button>
      </Card>
    </div>
  );
}

function PropertiesPanel({ selectedStep }: { selectedStep: WorkflowStepType | null }) {
    if (!selectedStep) {
        return (
            <Card className="sticky top-0">
                <CardHeader>
                    <CardTitle>Properties</CardTitle>
                    <CardDescription>Select a step to see its properties.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground pt-8">
                    <Settings2 className="mx-auto h-10 w-10" />
                    <p className="mt-2">No step selected</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="sticky top-0">
            <CardHeader>
                <CardTitle>{selectedStep.title}</CardTitle>
                <CardDescription>Configure the properties for this step.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Placeholder for actual properties form */}
                <p className="text-sm text-muted-foreground">Properties for "{selectedStep.title}" will be here.</p>
            </CardContent>
        </Card>
    );
}


export default function AgentBuilderPage() {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepType[]>([]);
  const [activeStep, setActiveStep] = useState<WorkflowStepType | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.isPaletteItem) {
        const { step } = event.active.data.current;
        setActiveStep({ ...step, id: `instance-${Date.now()}` });
    } else {
        const activeId = event.active.id;
        const step = workflowSteps.find(s => s.id === activeId);
        if(step) setActiveStep(step);
    }
    setSelectedStepId(null);
  }, [workflowSteps]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveStep(null);
    const { active, over } = event;
  
    if (!over) return;
  
    const isPaletteItem = active.data.current?.isPaletteItem;
  
    if (isPaletteItem) {
      const { step } = active.data.current;
      const newStep = { ...step, id: `instance-${Date.now()}` };
  
      const overId = over.id;
  
      if (overId === 'canvas-droppable' || workflowSteps.find(s => s.id === overId)) {
        const overIndex = workflowSteps.findIndex(s => s.id === overId);
        
        if (overIndex !== -1) {
           setWorkflowSteps(prev => {
            const newSteps = [...prev];
            newSteps.splice(overIndex, 0, newStep);
            return newSteps;
          });
        } else {
          setWorkflowSteps(prev => [...prev, newStep]);
        }
        setSelectedStepId(newStep.id);
      }
      return;
    }
  
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId !== overId) {
      setWorkflowSteps((steps) => {
        const oldIndex = steps.findIndex((s) => s.id === activeId);
        const newIndex = steps.findIndex((s) => s.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(steps, oldIndex, newIndex);
        }
        return steps;
      });
    }
  }, [workflowSteps]);
  
  const handleRemoveStep = (id: UniqueIdentifier) => {
    setWorkflowSteps(prev => prev.filter(s => s.id !== id));
    if (selectedStepId === id) {
        setSelectedStepId(null);
    }
  };

  const selectedStep = workflowSteps.find(s => s.id === selectedStepId) || null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
          <Sidebar collapsible="icon" side="left" variant="sidebar" className="group">
              <SidebarContent className="p-0">
                  <div className="flex flex-col h-full">
                      <SidebarHeader className="p-2 border-b">
                           <div className="flex items-center justify-between">
                              <CardTitle className="text-lg font-semibold px-2">Library</CardTitle>
                              <SidebarTrigger/>
                          </div>
                          <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Search templates..." className="pl-8" />
                          </div>
                      </SidebarHeader>

                      <div className="flex-1 overflow-y-auto p-2 space-y-2">
                          <p className="px-2 text-xs font-semibold text-muted-foreground tracking-wider">TEMPLATES</p>
                          {workflowTemplates.map(template => (
                               <Card key={template.title} className="cursor-pointer hover:bg-accent transition-colors">
                                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-3">
                                      <div className="p-2 bg-muted rounded-md">{template.icon}</div>
                                      <div className="group-data-[collapsible=icon]:hidden">
                                          <CardTitle className="text-sm font-medium">{template.title}</CardTitle>
                                          <CardDescription className="text-xs">{template.description}</CardDescription>
                                      </div>
                                  </CardHeader>
                              </Card>
                          ))}
                      </div>

                      <SidebarFooter className="mt-auto border-t p-2">
                           <SidebarMenu>
                               <SidebarMenuItem>
                                  <SidebarMenuButton tooltip="Documentation" className="justify-center group-data-[collapsible=icon]:justify-start">
                                      <LifeBuoy />
                                      <span className="group-data-[collapsible=icon]:hidden">Documentation</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                               <SidebarMenuItem>
                                  <SidebarMenuButton tooltip="User Profile" className="justify-center group-data-[collapsible=icon]:justify-start">
                                      <Avatar className="w-7 h-7">
                                          <AvatarFallback>U</AvatarFallback>
                                      </Avatar>
                                      <span className="group-data-[collapsible=icon]:hidden">User Profile</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                           </SidebarMenu>
                      </SidebarFooter>
                  </div>
              </SidebarContent>
          </Sidebar>
        
        {/* Node Palette - now in center top */}
        <main className="flex-1 flex flex-col p-4 bg-muted/20 overflow-y-auto" onClick={() => setSelectedStepId(null)}>
           <div className="bg-card border rounded-lg p-3 mb-4">
               <h2 className="text-lg font-semibold mb-2">AI Steps</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {aiStepsPalette.map(step => (
                      <DraggablePaletteItem key={step.id} step={step} />
                  ))}
               </div>
           </div>

          {/* Canvas Area */}
           <div ref={setNodeRef} id="canvas-droppable" className="flex-1 w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-start bg-background p-4 space-y-4 overflow-y-auto">
              {workflowSteps.length > 0 ? (
                <SortableContext items={workflowSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {workflowSteps.map(step => (
                    <SortableWorkflowStep key={step.id} step={step} onRemove={handleRemoveStep} onSelect={setSelectedStepId} isSelected={selectedStepId === step.id} />
                  ))}
                </SortableContext>
              ) : (
                <div className="flex-1 flex items-center justify-center pointer-events-none h-full">
                    <div className="text-center text-muted-foreground">
                        <Plus className="mx-auto h-8 w-8" />
                        <p>Drag AI steps here to build a workflow</p>
                    </div>
                </div>
              )}
            </div>
        </main>

        {/* Properties Panel */}
        <aside className="w-80 border-l p-4 bg-card overflow-y-auto hidden lg:block">
           <PropertiesPanel selectedStep={selectedStep} />
        </aside>
      </div>
    </SidebarProvider>
     <DragOverlay>
        {activeStep ? (
             <Card className={`p-3 cursor-grabbing shadow-lg ${activeStep.color}`}>
                <div className="flex flex-col items-center text-center gap-2">
                    {activeStep.icon}
                    <span className="font-semibold text-sm">{activeStep.title}</span>
                </div>
            </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
