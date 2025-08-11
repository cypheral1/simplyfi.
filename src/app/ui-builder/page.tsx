"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  UniqueIdentifier,
  closestCenter
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

const availableComponents = [
  { id: 'button', name: 'Button' },
  { id: 'card', name: 'Card' },
  { id: 'input', name: 'Input' },
  { id: 'h1', name: 'Heading 1' },
  { id: 'p', name: 'Paragraph' },
];

type Component = {
  id: UniqueIdentifier;
  type: string;
  name: string;
};

function DraggableComponent({ id, name }: { id: string, name: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${id}`,
    data: { id, name }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="border rounded-lg p-3 text-sm cursor-grab bg-card hover:bg-accent flex items-center gap-2"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {name}
    </div>
  );
}

function SortableComponent({ component, onRemove }: { component: Component, onRemove: (id: UniqueIdentifier) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-3 text-sm bg-card flex justify-between items-center"
    >
      <div className="flex items-center gap-2">
         <div {...attributes} {...listeners} className="cursor-grab p-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
         </div>
        {component.name}
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(component.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}


export default function UiBuilderPage() {
  const [canvasComponents, setCanvasComponents] = useState<Component[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });
  
  const activeComponent = activeId ? (canvasComponents.find(c => c.id === activeId) || availableComponents.find(c => `palette-${c.id}` === activeId)) : null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over?.id === 'canvas-droppable' && active.id.toString().startsWith('palette-')) {
        const { id, name } = active.data.current as { id: string, name: string};
        setCanvasComponents((components) => [
            ...components,
            { id: `${id}-${Date.now()}`, type: id, name },
        ]);
        return;
    }
    
    if (over && active.id !== over.id && !active.id.toString().startsWith('palette-')) {
        setCanvasComponents((items) => {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }

  function handleRemoveComponent(id: UniqueIdentifier) {
    setCanvasComponents(components => components.filter(c => c.id !== id));
  }

  return (
    <DndContext 
      onDragStart={(event) => setActiveId(event.active.id)}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
        {/* Component Palette */}
        <aside className="w-64 border-r p-4 space-y-4">
          <h2 className="text-lg font-semibold">Components</h2>
          <div className="space-y-2">
            {availableComponents.map(comp => (
              <DraggableComponent key={comp.id} id={comp.id} name={comp.name} />
            ))}
          </div>
        </aside>

        {/* Canvas Area */}
        <main ref={setNodeRef} className="flex-1 p-4">
          <div className="w-full h-full border-2 border-dashed rounded-lg flex flex-col p-4 space-y-2 overflow-y-auto">
            {canvasComponents.length === 0 ? (
               <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <h3 className="text-xl font-semibold">Drag components here</h3>
                    <p>Start building your UI by dragging from the left panel.</p>
                </div>
               </div>
            ) : (
                <SortableContext items={canvasComponents.map(c => c.id)}>
                    {canvasComponents.map(comp => (
                        <SortableComponent key={comp.id} component={comp} onRemove={handleRemoveComponent} />
                    ))}
                </SortableContext>
            )}
          </div>
        </main>

        {/* Properties Panel */}
        <aside className="w-80 border-l p-4">
          <Card>
              <CardHeader>
                  <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                  <p>Component properties will appear here.</p>
              </CardContent>
          </Card>
        </aside>
      </div>
      <DragOverlay>
        {activeId ? (
            <div className="border rounded-lg p-3 text-sm cursor-grabbing bg-card shadow-lg flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                {activeComponent?.name}
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
