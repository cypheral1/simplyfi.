"use client";

import { useState, useEffect } from 'react';
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
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
    data: { type: id, name, isPaletteItem: true }
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
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  const getActiveComponentData = () => {
    if (!activeId) return null;
    const canvasComp = canvasComponents.find(c => c.id === activeId);
    if (canvasComp) return { ...canvasComp, isPaletteItem: false };
    
    const paletteId = activeId.toString();
    if (paletteId.startsWith('palette-')) {
      const type = paletteId.replace('palette-', '');
      const item = availableComponents.find(c => c.id === type);
      if (item) {
        return { ...item, type: item.id, isPaletteItem: true };
      }
    }
    return null;
  }
  const activeComponentData = getActiveComponentData();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over) {
      return;
    }
  
    const isDroppingNewComponent = active.data.current?.isPaletteItem;
    const isReordering = !isDroppingNewComponent;
  
    // Reordering existing components on the canvas
    if (isReordering && over.id !== active.id) {
      setCanvasComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
      return;
    }
  
    // Dropping a new component from the palette
    if (isDroppingNewComponent) {
      const { type, name } = active.data.current as { type: string; name: string };
      const newComponent: Component = {
        id: `${type}-${Date.now()}`,
        type,
        name,
      };
      
      const overId = over.id;
      const overIsCanvas = overId === 'canvas-droppable';
      const overIndex = canvasComponents.findIndex(c => c.id === overId);
  
      if (overIsCanvas) {
        setCanvasComponents(items => [...items, newComponent]);
      } else if (overIndex !== -1) {
        setCanvasComponents(items => {
          const newItems = [...items];
          newItems.splice(overIndex, 0, newComponent);
          return newItems;
        });
      }
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
        <main className="flex-1 p-4 bg-muted/20 overflow-y-auto">
          <div ref={setNodeRef} id="canvas-droppable" className="w-full min-h-full border-2 border-dashed rounded-lg flex flex-col p-4 space-y-4 bg-background">
            {canvasComponents.length === 0 ? (
               <div className="flex-1 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground">
                    <h3 className="text-xl font-semibold">Drag components here</h3>
                    <p>Start building your UI by dragging from the left panel.</p>
                </div>
               </div>
            ) : (
                <SortableContext items={canvasComponents.map(c => c.id)} strategy={verticalListSortingStrategy}>
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