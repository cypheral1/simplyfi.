
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Component Definitions
const availableComponents = [
  { id: 'button', name: 'Button' },
  { id: 'card', name: 'Card' },
  { id: 'input', name: 'Input' },
  { id: 'h1', name: 'Heading 1' },
  { id: 'p', name: 'Paragraph' },
  { id: 'textarea', name: 'Text Area' },
];

type Component = {
  id: UniqueIdentifier;
  type: string;
  name: string;
  props: { [key: string]: any };
};

const componentMap: { [key: string]: (props: any) => React.ReactNode } = {
  button: (props) => <Button {...props}>{props.text || 'Click me'}</Button>,
  card: (props) => (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{props.title || 'Card Title'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{props.content || 'Card content goes here.'}</p>
      </CardContent>
    </Card>
  ),
  input: (props) => <Input {...props} placeholder={props.placeholder || 'Input field'} />,
  h1: (props) => <h1 {...props} className="text-4xl font-bold tracking-tight">{props.text || 'Heading 1'}</h1>,
  p: (props) => <p {...props}>{props.text || 'This is a paragraph of text.'}</p>,
  textarea: (props) => <Textarea {...props} placeholder={props.placeholder || 'Text area'} />,
};

function DraggableComponent({ id, name }: { id: string, name: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${id}`,
    data: { type: id, name, isPaletteItem: true }
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className="border rounded-lg p-3 text-sm cursor-grab bg-card hover:bg-accent flex items-center gap-2"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {name}
    </div>
  );
}

function SortableComponent({ component, onRemove, onSelect, isSelected }: { component: Component, onRemove: (id: UniqueIdentifier) => void, onSelect: (id: UniqueIdentifier) => void, isSelected: boolean }) {
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

  const ComponentToRender = componentMap[component.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id)
      }}
      className={cn(
          "p-4 bg-transparent rounded-lg relative group border-2",
          isSelected ? "border-primary" : "border-transparent hover:border-dashed hover:border-muted-foreground/50"
      )}
    >
       <div {...attributes} {...listeners} className="cursor-grab p-2 absolute top-1 left-1 z-10 opacity-20 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
       </div>
       <Button variant="ghost" size="icon" className="h-7 w-7 absolute top-1 right-1 z-10 opacity-20 group-hover:opacity-100 transition-opacity" onClick={(e) => {
           e.stopPropagation();
           onRemove(component.id);
       }}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
      <div className="pointer-events-none">
        {ComponentToRender ? ComponentToRender(component.props) : <p>Unknown Component</p>}
      </div>
    </div>
  );
}

function Canvas({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) {
    const { setNodeRef } = useDroppable({
        id: 'canvas-droppable',
    });

    return (
        <div 
          ref={setNodeRef} 
          className="w-full min-h-full border-2 border-dashed rounded-lg p-4 space-y-4 bg-background"
          onClick={onSelect}
        >
            {children}
        </div>
    )
}

function PropertiesPanel({ selectedComponent, onPropsChange }: { selectedComponent: Component | null, onPropsChange: (id: UniqueIdentifier, newProps: any) => void }) {
    if (!selectedComponent) {
        return (
             <Card className="sticky top-4">
                <CardHeader>
                    <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Select a component to see its properties.</p>
                </CardContent>
            </Card>
        )
    }

    const handlePropChange = (propName: string, value: any) => {
        onPropsChange(selectedComponent.id, { ...selectedComponent.props, [propName]: value });
    };

    const renderPropEditor = (propName: string, propValue: any) => {
        const key = `${selectedComponent.id}-${propName}`;
        
        // Simple heuristic to determine editor type
        if (typeof propValue === 'string' && propValue.length > 50) {
            return (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">{propName}</Label>
                    <Textarea id={key} value={propValue} onChange={(e) => handlePropChange(propName, e.target.value)} />
                </div>
            )
        }
        
        // Default to text input
        return (
            <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">{propName}</Label>
                <Input id={key} type="text" value={propValue} onChange={(e) => handlePropChange(propName, e.target.value)} />
            </div>
        )
    }

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>{selectedComponent.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(selectedComponent.props).map(([propName, propValue]) => renderPropEditor(propName, propValue))}
            </CardContent>
        </Card>
    )
}


export default function UiBuilderPage() {
  const [canvasComponents, setCanvasComponents] = useState<Component[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<UniqueIdentifier | null>(null);
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
  
  const getActiveComponentData = () => {
    if (!activeId) return null;
    const canvasComp = canvasComponents.find(c => c.id === activeId);
    if (canvasComp) return { ...canvasComp, isPaletteItem: false };
    
    const paletteId = activeId.toString();
    if (paletteId.startsWith('palette-')) {
      const type = paletteId.replace('palette-', '');
      const item = availableComponents.find(c => c.id === type);
      if (item) {
        return { id: item.id, name: item.name, type: item.id, isPaletteItem: true };
      }
    }
    return null;
  }
  const activeComponentData = getActiveComponentData();
  const selectedComponent = canvasComponents.find(c => c.id === selectedComponentId) || null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over) {
      return;
    }

    // Handle dropping a new component
    if (active.data.current?.isPaletteItem) {
      const { type, name } = active.data.current as { type: string, name: string };
      const newComponent: Component = {
        id: `${type}-${Date.now()}`,
        type,
        name,
        props: type === 'button' ? { text: 'New Button' } : type === 'card' ? { title: 'New Card', content: 'Some default content.' } : type === 'input' ? { placeholder: 'New Input' } : type === 'h1' ? { text: 'New Heading' } : type === 'p' ? { text: 'New Paragraph' } : type === 'textarea' ? { placeholder: 'New Text Area' } : {},
      };

      const overId = over.id;
      const overIsCanvas = overId === 'canvas-droppable';
      
      if (overIsCanvas) {
        setCanvasComponents(items => [...items, newComponent]);
      } else {
        const overIndex = canvasComponents.findIndex(c => c.id === overId);
        if (overIndex !== -1) {
            setCanvasComponents(items => {
                const newItems = [...items];
                newItems.splice(overIndex, 0, newComponent);
                return newItems;
            });
        } else {
            setCanvasComponents(items => [...items, newComponent]);
        }
      }
      setSelectedComponentId(newComponent.id);
    } 
    // Handle reordering an existing component
    else if (active.id !== over.id) {
        setCanvasComponents((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }

  function handleRemoveComponent(id: UniqueIdentifier) {
    if (selectedComponentId === id) {
        setSelectedComponentId(null);
    }
    setCanvasComponents(components => components.filter(c => c.id !== id));
  }

  function handleSelectComponent(id: UniqueIdentifier) {
    setSelectedComponentId(id);
  }
  
  function handleDeselect() {
      setSelectedComponentId(null);
  }

  function handlePropsChange(id: UniqueIdentifier, newProps: any) {
    setCanvasComponents(components => components.map(c => {
        if (c.id === id) {
            return { ...c, props: newProps };
        }
        return c;
    }));
  }
  
  if (!isClient) {
    return null;
  }

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={(event) => setActiveId(event.active.id)}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
        {/* Component Palette */}
        <aside className="w-64 border-r p-4 space-y-4 bg-card overflow-y-auto">
          <h2 className="text-lg font-semibold">Components</h2>
          <div className="space-y-2">
            {availableComponents.map(comp => (
              <DraggableComponent key={comp.id} id={comp.id} name={comp.name} />
            ))}
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 p-4 bg-muted/20 overflow-y-auto">
            <Canvas onSelect={handleDeselect}>
                {canvasComponents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center pointer-events-none h-full">
                        <div className="text-center text-muted-foreground">
                            <h3 className="text-xl font-semibold">Drag components here</h3>
                            <p>Start building your UI by dragging from the left panel.</p>
                        </div>
                    </div>
                ) : (
                    <SortableContext items={canvasComponents.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {canvasComponents.map(comp => (
                            <SortableComponent 
                                key={comp.id} 
                                component={comp} 
                                onRemove={handleRemoveComponent} 
                                onSelect={handleSelectComponent}
                                isSelected={comp.id === selectedComponentId}
                            />
                        ))}
                    </SortableContext>
                )}
            </Canvas>
        </main>

        {/* Properties Panel */}
        <aside className="w-80 border-l p-4 bg-card overflow-y-auto">
          <PropertiesPanel selectedComponent={selectedComponent} onPropsChange={handlePropsChange} />
        </aside>
      </div>
      <DragOverlay>
        {activeComponentData ? (
            <div className="border rounded-lg p-3 text-sm cursor-grabbing bg-card shadow-lg flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                {activeComponentData?.name}
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
