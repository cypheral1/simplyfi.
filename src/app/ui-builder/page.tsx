
"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { GripVertical, Trash2, Code, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { saveComponentToFile } from './actions';


// Component Definitions
const availableComponents = [
  { id: 'h1', name: 'Heading 1', icon: () => <span className="font-bold text-xl">H1</span> },
  { id: 'p', name: 'Paragraph', icon: () => <span className="text-sm">P</span> },
  { id: 'button', name: 'Button', icon: () => <Button size="sm" variant="outline" className="pointer-events-none h-auto py-1">Button</Button> },
  { id: 'input', name: 'Input', icon: () => <Input className="pointer-events-none h-8" placeholder="Input" /> },
  { id: 'textarea', name: 'Text Area', icon: () => <Textarea className="pointer-events-none h-8" placeholder="Textarea" /> },
  { id: 'card', name: 'Card', icon: () => <div className="pointer-events-none border rounded-md p-1 text-xs">Card</div> },
  { id: 'checkbox', name: 'Checkbox', icon: () => <div className="flex items-center gap-2 pointer-events-none"><Checkbox id="palette-check" /><Label htmlFor="palette-check" className="text-xs">Checkbox</Label></div> },
  { id: 'switch', name: 'Switch', icon: () => <Switch className="pointer-events-none" /> },
  { id: 'select', name: 'Select', icon: () => <div className="text-xs pointer-events-none">Select</div> },
  { id: 'slider', name: 'Slider', icon: () => <Slider defaultValue={[50]} className="w-16 pointer-events-none" /> },
  { id: 'avatar', name: 'Avatar', icon: () => <Avatar className="w-8 h-8 pointer-events-none"><AvatarFallback>AV</AvatarFallback></Avatar> },
];

type Component = {
  id: UniqueIdentifier;
  type: string;
  name: string;
  props: { [key: string]: any };
};

const componentMap: { [key: string]: (props: any) => React.ReactNode } = {
  button: (props) => <Button {...props}>{props.children || 'Click me'}</Button>,
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
  h1: (props) => <h1 {...props} className="text-4xl font-bold tracking-tight">{props.children || 'Heading 1'}</h1>,
  p: (props) => <p {...props}>{props.children || 'This is a paragraph of text.'}</p>,
  textarea: (props) => <Textarea {...props} placeholder={props.placeholder || 'Text area'} />,
  checkbox: (props) => <div className="flex items-center space-x-2"><Checkbox id={props.id || 'checkbox'} checked={props.checked} /><Label htmlFor={props.id || 'checkbox'}>{props.children || 'Accept terms'}</Label></div>,
  select: (props) => (
    <Select value={props.value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={props.placeholder || "Select an option"} />
      </SelectTrigger>
      <SelectContent>
        {(props.options || ['Option 1', 'Option 2', 'Option 3']).map((opt: string) => (
            <SelectItem key={opt} value={opt.toLowerCase().replace(' ','-')}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  switch: (props) => <div className="flex items-center space-x-2"><Switch id={props.id || 'switch'} checked={props.checked} /><Label htmlFor={props.id || 'switch'}>{props.children || 'Toggle me'}</Label></div>,
  slider: (props) => <Slider {...props} defaultValue={[props.defaultValue]} max={props.max} step={props.step} className="w-full" />,
  avatar: (props) => (
    <Avatar {...props}>
      <AvatarImage src={props.src || 'https://github.com/shadcn.png'} alt={props.alt || '@shadcn'} />
      <AvatarFallback>{props.fallback || 'CN'}</AvatarFallback>
    </Avatar>
  ),
};

const initialProps: { [key: string]: any } = {
    h1: { children: 'Main Title' },
    p: { children: 'A descriptive paragraph to elaborate.' },
    button: { children: 'Click Me', variant: 'default', size: 'default' },
    input: { placeholder: 'Enter text...', type: 'text' },
    textarea: { placeholder: 'Enter a longer text...' },
    card: { title: 'Card Title', content: 'This is the card content.' },
    checkbox: { children: 'I agree', checked: false },
    switch: { children: 'Airplane Mode', checked: false },
    select: { placeholder: 'Select a fruit', options: ['Apple', 'Banana', 'Blueberry'] },
    slider: { defaultValue: 50, max: 100, step: 1 },
    avatar: { src: 'https://placehold.co/40x40.png', alt: 'User Avatar', fallback: 'AV' },
}

function DraggableComponent({ id, name, icon }: { id: string, name: string, icon: () => React.ReactNode }) {
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
      className="border rounded-lg p-3 text-sm cursor-grab bg-card hover:bg-accent flex items-center gap-3"
    >
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1 flex items-center gap-2">
        {icon()}
        <span className="font-medium">{name}</span>
      </div>
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
       <div {...attributes} {...listeners} className="cursor-grab p-2 absolute top-1 left-1 z-10 opacity-20 group-hover:opacity-100 transition-opacity bg-background rounded-md">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
       </div>
       <Button variant="ghost" size="icon" className="h-7 w-7 absolute top-1 right-1 z-10 opacity-20 group-hover:opacity-100 transition-opacity bg-background rounded-md" onClick={(e) => {
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
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-droppable',
    });

    return (
        <div 
          ref={setNodeRef} 
          className={cn(
            "w-full min-h-full border-2 border-dashed rounded-lg p-4 space-y-4 bg-background transition-colors",
            isOver ? "border-primary bg-primary/10" : "border-border"
            )}
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
        const type = typeof propValue;

        if (propName === 'variant' && selectedComponent.type === 'button') {
            return (
                 <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">{propName}</Label>
                    <Select value={propValue} onValueChange={(val) => handlePropChange(propName, val)}>
                        <SelectTrigger id={key}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="destructive">Destructive</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="ghost">Ghost</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )
        }
        
        if (type === 'boolean') {
             return (
                <div key={key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor={key} className="capitalize">{propName}</Label>
                    <Switch id={key} checked={propValue} onCheckedChange={(val) => handlePropChange(propName, val)} />
                </div>
            )
        }

        if (propName === 'options' && Array.isArray(propValue)) {
            return (
                 <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">{propName} (comma separated)</Label>
                    <Textarea id={key} value={propValue.join(', ')} onChange={(e) => handlePropChange(propName, e.target.value.split(',').map(s => s.trim()))} />
                </div>
            )
        }
        
        if (type === 'string' && propValue.length > 30) {
            return (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">{propName}</Label>
                    <Textarea id={key} value={propValue} onChange={(e) => handlePropChange(propName, e.target.value)} />
                </div>
            )
        }
        
        return (
            <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">{propName}</Label>
                <Input id={key} type={type === 'number' ? 'number' : 'text'} value={propValue} onChange={(e) => handlePropChange(propName, type === 'number' ? parseFloat(e.target.value) : e.target.value)} />
            </div>
        )
    }

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>{selectedComponent.name}</CardTitle>
                <CardDescription>Type: {selectedComponent.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(selectedComponent.props).map(([propName, propValue]) => renderPropEditor(propName, propValue))}
            </CardContent>
        </Card>
    )
}

function generateJsx(components: Component[]): string {
    const imports = new Set<string>();
    const componentImports: {[key: string]: string[]} = {
        h1: [], p: [],
        button: ['Button'],
        input: ['Input'],
        textarea: ['Textarea'],
        card: ['Card', 'CardContent', 'CardHeader', 'CardTitle'],
        checkbox: ['Checkbox', 'Label'],
        switch: ['Switch', 'Label'],
        select: ['Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue'],
        slider: ['Slider'],
        avatar: ['Avatar', 'AvatarFallback', 'AvatarImage'],
    };

    const componentCode = components.map(component => {
        const { type, props } = component;
        if (componentImports[type]) {
            componentImports[type].forEach(imp => imports.add(imp));
        }

        const propToString = (prop: string, value: any): string => {
            if (prop === 'children' || prop === 'options') return '';
            if (typeof value === 'string') return `${prop}="${value}"`;
            if (typeof value === 'number') return `${prop}={${value}}`;
            if (typeof value === 'boolean') return value ? prop : `${prop}={false}`;
            return `${prop}="${value}"`;
        };
        
        const propsString = Object.entries(props)
            .map(([key, value]) => propToString(key, value))
            .filter(Boolean)
            .join(' ');
        
        const Comp = type.charAt(0).toUpperCase() + type.slice(1);
        
        switch (type) {
            case 'h1':
            case 'p':
                return `<${type} ${propsString}>${props.children || ''}</${type}>`;
            case 'input':
            case 'textarea':
            case 'slider':
                return `<${Comp} ${propsString} />`;
             case 'avatar':
                return `<Avatar ${propsString}><AvatarImage src="${props.src}" alt="${props.alt}" /><AvatarFallback>${props.fallback}</AvatarFallback></Avatar>`;
            case 'card':
                imports.add('CardDescription');
                return `<Card ${propsString}>\n  <CardHeader>\n    <CardTitle>${props.title || ''}</CardTitle>\n    <CardDescription>${props.description || 'Card Description'}</CardDescription>\n  </CardHeader>\n  <CardContent>\n    <p>${props.content || ''}</p>\n  </CardContent>\n</Card>`;
            case 'checkbox':
                return `<div className="flex items-center space-x-2">\n  <Checkbox id="${component.id}" ${props.checked ? 'defaultChecked' : ''} />\n  <Label htmlFor="${component.id}">${props.children}</Label>\n</div>`;
            case 'switch':
                 return `<div className="flex items-center space-x-2">\n  <Switch id="${component.id}" ${props.checked ? 'defaultChecked' : ''} />\n  <Label htmlFor="${component.id}">${props.children}</Label>\n</div>`;
            case 'select':
                return `<Select>\n  <SelectTrigger>\n    <SelectValue placeholder="${props.placeholder}" />\n  </SelectTrigger>\n  <SelectContent>\n    ${(props.options || []).map((opt:string) => `<SelectItem value="${opt.toLowerCase().replace(/\\s+/g, '-')}">${opt}</SelectItem>`).join('\n    ')}\n  </SelectContent>\n</Select>`
            default:
                 return `<${Comp} ${propsString}>${props.children || ''}</${Comp}>`;
        }
    }).join('\n\n');

    const getUiImports = () => {
        const allImports = new Set<string>();
        components.forEach(c => {
            (componentImports[c.type] || []).forEach(imp => allImports.add(imp));
            if(c.type === 'card') allImports.add('CardDescription');
        });
        if (allImports.size === 0) return '';
        
        const sortedImports = Array.from(allImports).sort();
        const componentName = `{\n  ${sortedImports.join(',\n  ')}\n}`;
        
        let path = '';
        if (sortedImports.includes('Button')) path = '@/components/ui/button';
        else if (sortedImports.includes('Input')) path = '@/components/ui/input';
        else if (sortedImports.includes('Textarea')) path = '@/components/ui/textarea';
        else if (sortedImports.includes('Card')) path = '@/components/ui/card';
        else if (sortedImports.includes('Checkbox')) path = '@/components/ui/checkbox';
        else if (sortedImports.includes('Switch')) path = '@/components/ui/switch';
        else if (sortedImports.includes('Select')) path = '@/components/ui/select';
        else if (sortedImports.includes('Slider')) path = '@/components/ui/slider';
        else if (sortedImports.includes('Avatar')) path = '@/components/ui/avatar';
        else if (sortedImports.includes('Label')) path = '@/components/ui/label';

        if(allImports.size > 1) {
          path = '@/components/ui';
        }
        
        // This is a bit of a hack, we should find a better way
        const finalImports = Array.from(allImports).sort().join(', ');

        return `import { ${finalImports} } from '${path}';`;
    }

    const importString = getUiImports();

    return `import React from 'react';\n${importString ? `${importString}\n` : ''}
export default function GeneratedComponent() {
  return (
    <div className="space-y-4 p-4">
${componentCode.split('\n').map(line => `      ${line}`).join('\n')}
    </div>
  );
}`;
}

function CodeGenerationDialog({ components }: { components: Component[] }) {
    const [open, setOpen] = useState(false);
    const [componentName, setComponentName] = useState('MyNewComponent');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const jsxCode = generateJsx(components);

    const handleSave = async () => {
        if (!componentName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
            toast({
                title: 'Invalid Component Name',
                description: 'Component name must be PascalCase (e.g., MyComponent).',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            const result = await saveComponentToFile({
                componentName,
                code: jsxCode,
            });
            if (result.success) {
                toast({
                    title: 'Component Saved!',
                    description: `File saved at ${result.path}`,
                });
                setOpen(false);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: 'Error Saving File',
                description: error.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={components.length === 0}>
                    <Code className="mr-2 h-4 w-4" />
                    Generate Code
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Generated JSX Code</DialogTitle>
                    <DialogDescription>
                        Here is the code for the layout you built. You can copy it or save it as a new component file.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <pre className="bg-muted rounded-md p-4 h-[400px] overflow-auto text-sm">
                        <code>{jsxCode}</code>
                    </pre>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => navigator.clipboard.writeText(jsxCode).then(() => toast({ title: "Code copied!"}))}
                    >
                        Copy
                    </Button>
                </div>
                <DialogFooter>
                    <div className="flex items-center gap-2 w-full">
                        <Input
                            placeholder="ComponentName"
                            value={componentName}
                            onChange={(e) => setComponentName(e.target.value)}
                        />
                         <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : <><Download className="mr-2 h-4 w-4" /> Save as Component</>}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
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
        return { id: item.id, name: item.name, type: item.id, isPaletteItem: true, icon: item.icon };
      }
    }
    return null;
  }
  const activeComponentData = getActiveComponentData();
  const selectedComponent = canvasComponents.find(c => c.id === selectedComponentId) || null;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over) {
      return;
    }

    const overId = over.id;
    const overIsCanvas = overId === 'canvas-droppable';
    const overIsSortable = canvasComponents.some(c => c.id === overId);

    // Handle dropping a new component from the palette
    if (active.data.current?.isPaletteItem) {
      const { type, name } = active.data.current as { type: string, name: string };
      const newComponent: Component = {
        id: `${type}-${Date.now()}`,
        type,
        name,
        props: initialProps[type] || {},
      };

      if (overIsCanvas) {
        setCanvasComponents(items => [...items, newComponent]);
      } else if(overIsSortable) {
        const overIndex = canvasComponents.findIndex(c => c.id === overId);
        if (overIndex !== -1) {
            setCanvasComponents(items => {
                const newItems = [...items];
                newItems.splice(overIndex, 0, newComponent);
                return newItems;
            });
        }
      }
      setSelectedComponentId(newComponent.id);
      return;
    } 
    
    // Handle reordering an existing component
    if (!active.data.current?.isPaletteItem && overIsSortable && active.id !== over.id) {
        setCanvasComponents((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }, [canvasComponents]);


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
    return (
        <div className="flex h-[calc(100vh-4.1rem)] w-full items-center justify-center">
            <p>Loading Builder...</p>
        </div>
    );
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
        <aside className="w-72 border-r p-4 space-y-4 bg-card overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Components</h2>
            <CodeGenerationDialog components={canvasComponents} />
          </div>
          <div className="space-y-2">
            {availableComponents.map(comp => (
              <DraggableComponent key={comp.id} id={comp.id} name={comp.name} icon={comp.icon} />
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
            <div className="border rounded-lg p-3 text-sm cursor-grabbing bg-card shadow-lg flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                {activeComponentData.icon && activeComponentData.icon()}
                <span className="font-medium">{activeComponentData.name}</span>
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
