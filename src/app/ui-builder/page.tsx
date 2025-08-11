"use client";

import { useState, useEffect, useId } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
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
  { id: 'button', name: 'Button', component: <Button>Click me</Button> },
  { id: 'card', name: 'Card', component: <Card><CardHeader><CardTitle>Card</CardTitle></CardHeader><CardContent>Card content</CardContent></Card>},
  { id: 'input', name: 'Input', component: <Input placeholder="Input field" /> },
  { id: 'h1', name: 'Heading 1', component: <h1 className="text-4xl font-bold">Heading 1</h1> },
  { id: 'p', name: 'Paragraph', component: <p>This is a paragraph.</p> },
];

type Component = {
  id: UniqueIdentifier;
  type: string;
  name: string;
};

const componentMap: { [key: string]: React.ReactNode } = {
    button: <Button>Click me</Button>,
    card: <Card><CardHeader><CardTitle>Card</CardTitle></CardHeader><CardContent><p>Card content goes here.</p></CardContent></Card>,
    input: <Input placeholder="Input field" />,
    h1: <h1 className="text-4xl font-bold tracking-tight">Heading 1</h1>,
    p: <p>This is a paragraph of text.</p>
};

function DraggableComponent({ id, name }: { id: string, name: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${id}`,
    data: { id, name, isPaletteItem: true }
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
      className="p-2 bg-card/50 rounded-lg relative group"
    >
       <div {...attributes} {...listeners} className="cursor-grab p-2 absolute top-0 left-0 z-10 opacity-20 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
       </div>
       <Button variant="ghost" size="icon" className="h-7 w-7 absolute top-1 right-1 z-10 opacity-20 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(component.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
      <div className="pointer-events-none">
        {componentMap[component.type]}
      </div>
    </div>
  );
}


export default function UiBuilderPage() {
  const [canvasComponents, setCanvasComponents] = useState<Component[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isClient, setIsClient] = useState(false);
  const componentId = useId();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });
  
  const activeComponentData = activeId ? (canvasComponents.find(c => c.id === activeId) || (activeId.toString().startsWith('palette-') && availableComponents.find(c => `palette-${c.id}` === activeId))) : null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over?.id === 'canvas-droppable' && active.data.current?.isPaletteItem) {
        const { id, name } = active.data.current as { id: string, name: string};
        setCanvasComponents((components) => [
            ...components,
            { id: `${id}-${componentId}-${components.length}`, type: id, name },
        ]);
        return;
    }
    
    if (over && active.id !== over.id && !active.data.current?.isPaletteItem) {
        setCanvasComponents((items) => {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);

            if (newIndex === -1) return items;

            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }

  function handleRemoveComponent(id: UniqueIdentifier) {
    setCanvasComponents(components => components.filter(c => c.id !== id));
  }
  
  if (!isClient) {
    return null;
  }

  return (
    <DndContext 
      onDragStart={(event) => setActiveId(event.active.id)}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
        {/* Component Palette */}
        <aside className="w-64 border-r p-4 space-y-4 bg-card">
          <h2 className="text-lg font-semibold">Components</h2>
          <div className="space-y-2">
            {availableComponents.map(comp => (
              <DraggableComponent key={comp.id} id={comp.id} name={comp.name} />
            ))}
          </div>
        </aside>

        {/* Canvas Area */}
        <main ref={setNodeRef} className="flex-1 p-4 bg-muted/20">
          <div className="w-full h-full border-2 border-dashed rounded-lg flex flex-col p-4 space-y-4 overflow-y-auto bg-background">
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
        <aside className="w-80 border-l p-4 bg-card">
          <Card>
              <CardHeader>
                  <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                  <p>Select a component to see its properties.</p>
              </CardContent>
          </Card>
        </aside>
      </div>
      <DragOverlay>
        {activeId && activeComponentData ? (
            <div className="border rounded-lg p-3 text-sm cursor-grabbing bg-card shadow-lg flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                {activeComponentData?.name}
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
