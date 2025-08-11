
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionComponent } from "@/components/ui/card";
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
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Code, Download, Plus } from 'lucide-react';
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
  { id: 'container', name: 'Container', icon: () => <div className="pointer-events-none border rounded-md p-1 text-xs border-dashed w-full h-8 flex items-center justify-center">Container</div> },
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
  children?: Component[];
};

const componentMap: { [key: string]: (props: any) => React.ReactNode } = {
  button: (props) => <Button {...props}>{props.children || 'Click me'}</Button>,
  card: (props) => (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{props.title || 'Card Title'}</CardTitle>
        <CardDescriptionComponent>{props.description || 'Card Description'}</CardDescriptionComponent>
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
  container: ({ children, onSelect, isOver, isSelected, id }) => (
    <DroppableContainer
        id={id}
        items={children || []}
        onSelect={onSelect}
        isOver={isOver}
        isSelected={isSelected}
    />
  ),
};

const initialProps: { [key: string]: any } = {
    h1: { children: 'Main Title' },
    p: { children: 'A descriptive paragraph to elaborate.' },
    button: { children: 'Click Me', variant: 'default', size: 'default' },
    input: { placeholder: 'Enter text...', type: 'text' },
    textarea: { placeholder: 'Enter a longer text...' },
    card: { title: 'Card Title', description: 'Card Description', content: 'This is the card content.' },
    checkbox: { children: 'I agree', checked: false },
    switch: { children: 'Airplane Mode', checked: false },
    select: { placeholder: 'Select a fruit', options: ['Apple', 'Banana', 'Blueberry'] },
    slider: { defaultValue: 50, max: 100, step: 1 },
    avatar: { src: 'https://placehold.co/40x40.png', alt: 'User Avatar', fallback: 'AV' },
    container: { className: "space-y-4 p-4 min-h-[100px] border border-dashed rounded-lg" },
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

function SortableComponent({ component, onRemove, onSelect, isSelected, parentId }: { component: Component, onRemove: (id: UniqueIdentifier, parentId: UniqueIdentifier | null) => void, onSelect: (id: UniqueIdentifier) => void, isSelected: boolean, parentId: UniqueIdentifier | null }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id, data: { parentId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ComponentToRender = componentMap[component.type];

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(component.id, parentId);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleSelect}
      className={cn(
          "p-2 bg-transparent rounded-lg relative group border-2",
          isSelected ? "border-primary" : "border-transparent hover:border-dashed hover:border-muted-foreground/50"
      )}
    >
       <div {...attributes} {...listeners} className="cursor-grab p-2 absolute top-1 left-1 z-10 opacity-20 group-hover:opacity-100 transition-opacity bg-background rounded-md">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
       </div>
       <Button variant="ghost" size="icon" className="h-7 w-7 absolute top-1 right-1 z-10 opacity-20 group-hover:opacity-100 transition-opacity bg-background rounded-md" onClick={handleRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
      <div className="pointer-events-none">
        {ComponentToRender ? ComponentToRender({
            ...component.props, 
            children: component.children,
            id: component.id,
            onSelect: handleSelect, // for container
            isSelected
        }) : <p>Unknown Component</p>}
      </div>
    </div>
  );
}

function DroppableContainer({ id, items, onSelect, isSelected, isOver } : {id: UniqueIdentifier, items: Component[], onSelect: (e?: React.MouseEvent) => void, isSelected: boolean, isOver?: boolean}) {
    const { setNodeRef } = useDroppable({
        id
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
    }
    
    return (
      <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div 
          ref={setNodeRef} 
          onClick={handleClick}
          className={cn(
            "w-full min-h-full rounded-lg p-4 space-y-4 bg-background transition-colors",
            isOver ? "border-primary bg-primary/10 border-2 border-dashed" : (isSelected ? "border-primary border-2" : "border-border border-2 border-dashed"),
          )}
        >
            {items.length > 0 ? (
                items.map(comp => (
                    <SortableComponent 
                        key={comp.id} 
                        component={comp} 
                        onRemove={(childId, parentId) => (window as any).removeComponent(childId, parentId)} 
                        onSelect={(childId) => (window as any).selectComponent(childId)}
                        isSelected={ (window as any).selectedComponentId === comp.id}
                        parentId={id}
                    />
                ))
            ) : (
                 <div className="flex-1 flex items-center justify-center pointer-events-none h-full min-h-[50px]">
                    <div className="text-center text-muted-foreground">
                        <Plus className="mx-auto h-6 w-6" />
                        <p className="text-xs">Drag components here</p>
                    </div>
                </div>
            )}
        </div>
      </SortableContext>
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
        
        if (type === 'string' && propValue.length > 30 || propName === 'className') {
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
                <CardDescriptionComponent>Type: {selectedComponent.type}</CardDescriptionComponent>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(selectedComponent.props).map(([propName, propValue]) => renderPropEditor(propName, propValue))}
            </CardContent>
        </Card>
    )
}

function generateJsx(components: Component[], level = 0): string {
    const imports = new Set<string>();
    const componentImports: {[key: string]: string[]} = {
        h1: [], p: [], container: [],
        button: ['Button'],
        input: ['Input'],
        textarea: ['Textarea'],
        card: ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'CardDescription'],
        checkbox: ['Checkbox', 'Label'],
        switch: ['Switch', 'Label'],
        select: ['Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue'],
        slider: ['Slider'],
        avatar: ['Avatar', 'AvatarFallback', 'AvatarImage'],
    };

    const componentCode = components.map(component => {
        const { type, props, children } = component;
        if (componentImports[type]) {
            componentImports[type].forEach(imp => imports.add(imp));
        }

        const propToString = (prop: string, value: any): string => {
            if (['children', 'options', 'title', 'content', 'description'].includes(prop)) return '';
            if (typeof value === 'boolean') return value ? prop : `${prop}={false}`;
            if (typeof value === 'number') return `${prop}={${value}}`;
            if (typeof value === 'string') return `${prop}="${value.replace(/"/g, '\\"')}"`;
            return ''; // ignore other prop types like objects/arrays for now
        };
        
        const propsString = Object.entries(props)
            .map(([key, value]) => propToString(key, value))
            .filter(Boolean)
            .join(' ');
        
        const Comp = type.charAt(0).toUpperCase() + type.slice(1);
        const indent = ' '.repeat((level + 2) * 2);
        
        switch (type) {
            case 'h1':
            case 'p':
                return `${indent}<${type} ${propsString}>${props.children || ''}</${type}>`;
            case 'input':
            case 'textarea':
            case 'slider':
                return `${indent}<${Comp} ${propsString} />`;
            case 'avatar':
                return `${indent}<Avatar ${propsString}><AvatarImage src="${props.src}" alt="${props.alt}" /><AvatarFallback>${props.fallback}</AvatarFallback></Avatar>`;
            case 'card':
                return `${indent}<Card ${propsString}>\n${indent}  <CardHeader>\n${indent}    <CardTitle>${props.title || ''}</CardTitle>\n${indent}    <CardDescription>${props.description || 'Card Description'}</CardDescription>\n${indent}  </CardHeader>\n${indent}  <CardContent>\n${indent}    <p>${props.content || ''}</p>\n${indent}  </CardContent>\n${indent}</Card>`;
            case 'checkbox':
                return `${indent}<div className="flex items-center space-x-2">\n${indent}  <Checkbox id="${component.id}" ${props.checked ? 'defaultChecked' : ''} />\n${indent}  <Label htmlFor="${component.id}">${props.children}</Label>\n${indent}</div>`;
            case 'switch':
                 return `${indent}<div className="flex items-center space-x-2">\n${indent}  <Switch id="${component.id}" ${props.checked ? 'defaultChecked' : ''} />\n${indent}  <Label htmlFor="${component.id}">${props.children}</Label>\n${indent}</div>`;
            case 'select':
                return `${indent}<Select>\n${indent}  <SelectTrigger>\n${indent}    <SelectValue placeholder="${props.placeholder}" />\n${indent}  </SelectTrigger>\n${indent}  <SelectContent>\n${indent}    ${(props.options || []).map((opt:string) => `<SelectItem value="${opt.toLowerCase().replace(/\s+/g, '-')}">${opt}</SelectItem>`).join(`\n${indent}    `)}\n${indent}  </SelectContent>\n${indent}</Select>`
            case 'container':
                 return `${indent}<div ${propsString ? `className="${props.className}"` : ''}>\n${generateJsx(children || [], level + 1)}\n${indent}</div>`
            default:
                 return `${indent}<${Comp} ${propsString}>${props.children || ''}</${Comp}>`;
        }
    }).join('\n\n');

    if (level > 0) return componentCode;

    // Root level only: generate imports
    const allImports = new Set<string>();
    const collectImports = (comps: Component[]) => {
        comps.forEach(c => {
            (componentImports[c.type] || []).forEach(imp => allImports.add(imp));
            if (c.children) collectImports(c.children);
        });
    }
    collectImports(components);
    
    const getUiImports = () => {
        if (allImports.size === 0) return '';
        
        const importGroups: {[key:string]: string[]} = {};
        allImports.forEach(imp => {
          let path: string = '';
          if (['Button'].includes(imp)) path = '@/components/ui/button';
          else if (['Input'].includes(imp)) path = '@/components/ui/input';
          else if (['Textarea'].includes(imp)) path = '@/components/ui/textarea';
          else if (['Card', 'CardContent', 'CardHeader', 'CardTitle', 'CardDescription'].includes(imp)) path = '@/components/ui/card';
          else if (['Checkbox'].includes(imp)) path = '@/components/ui/checkbox';
          else if (['Label'].includes(imp)) path = '@/components/ui/label';
          else if (['Switch'].includes(imp)) path = '@/components/ui/switch';
          else if (['Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue'].includes(imp)) path = '@/components/ui/select';
          else if (['Slider'].includes(imp)) path = '@/components/ui/slider';
          else if (['Avatar', 'AvatarFallback', 'AvatarImage'].includes(imp)) path = '@/components/ui/avatar';
          else return;

          if (!importGroups[path]) {
            importGroups[path] = [];
          }
          if(!importGroups[path].includes(imp)) {
            importGroups[path].push(imp);
          }
        });

       return Object.entries(importGroups).map(([path, imps]) => {
          return `import { ${imps.sort().join(', ')} } from '${path}';`
        }).join('\n');
    }

    const importString = getUiImports();

    return `import React from 'react';
${importString ? `${importString}\n` : ''}
export function MyNewComponent() {
  return (
    <div>
${componentCode}
    </div>
  );
}`;
}


function CodeGenerationDialog({ components }: { components: Component[] }) {
    const [open, setOpen] = useState(false);
    const [componentName, setComponentName] = useState('MyNewComponent');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const [jsxCode, setJsxCode] = useState('');

    useEffect(() => {
        if(open) {
            const code = generateJsx(components).replace(/MyNewComponent/g, componentName);
            setJsxCode(code);
        }
    }, [components, open, componentName]);

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
  const [activeComponent, setActiveComponent] = useState<Component | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<UniqueIdentifier | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Expose functions to window for SortableComponent to call
    (window as any).removeComponent = handleRemoveComponent;
    (window as any).selectComponent = handleSelectComponent;
    (window as any).selectedComponentId = selectedComponentId;
    
    return () => {
        delete (window as any).removeComponent;
        delete (window as any).selectComponent;
        delete (window as any).selectedComponentId;
    }
  }, [selectedComponentId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findComponent = (components: Component[], id: UniqueIdentifier | null): Component | null => {
      if (!id) return null;
      for (const component of components) {
          if (component.id === id) return component;
          if (component.children) {
              const found = findComponent(component.children, id);
              if (found) return found;
          }
      }
      return null;
  }
  
  const findParent = (components: Component[], id: UniqueIdentifier): Component | null => {
      for (const component of components) {
          if (component.children?.some(c => c.id === id)) return component;
          if (component.children) {
              const found = findParent(component.children, id);
              if (found) return found;
          }
      }
      return null;
  }

  const addComponent = (components: Component[], newComponent: Component, parentId: UniqueIdentifier | null): Component[] => {
      if (parentId === null) {
          return [...components, newComponent];
      }
      return components.map(c => {
          if (c.id === parentId) {
              return { ...c, children: [...(c.children || []), newComponent] };
          }
          if (c.children) {
              return { ...c, children: addComponent(c.children, newComponent, parentId) };
          }
          return c;
      });
  }
  
  const removeComponent = (components: Component[], id: UniqueIdentifier): Component[] => {
    return components.reduce((acc, comp) => {
        if (comp.id === id) return acc;
        if (comp.children) {
            comp.children = removeComponent(comp.children, id);
        }
        acc.push(comp);
        return acc;
    }, [] as Component[]);
  }

  const moveComponent = (components: Component[], activeId: UniqueIdentifier, overId: UniqueIdentifier): Component[] => {
        const activeComponent = findComponent(components, activeId);
        if (!activeComponent) return components;

        const newComponents = removeComponent(components, activeId);
        
        const overComponent = findComponent(newComponents, overId);
        
        if (overComponent && overComponent.type === 'container') {
             // Dropping into a container
            return addComponent(newComponents, activeComponent, overId);
        } else {
             // Dropping next to a component
            const overParent = findParent(newComponents, overId);
            const overParentChildren = overParent ? overParent.children || [] : newComponents;
            const overIndex = overParentChildren.findIndex(c => c.id === overId);
            
            const newParentChildren = [
                ...overParentChildren.slice(0, overIndex + 1),
                activeComponent,
                ...overParentChildren.slice(overIndex + 1)
            ];

            if (overParent) {
                return newComponents.map(c => c.id === overParent.id ? { ...c, children: newParentChildren } : c);
            }
            return newParentChildren;
        }
  };
  
  const selectedComponent = findComponent(canvasComponents, selectedComponentId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;
    if (data.current?.isPaletteItem) {
        const { type, name } = data.current;
        setActiveComponent({
            id: `new-${type}`,
            type,
            name,
            props: initialProps[type] || {},
            children: type === 'container' ? [] : undefined,
        });
    } else {
        setActiveComponent(findComponent(canvasComponents, active.id));
    }
  }, [canvasComponents]);


  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;

    const isActiveAPaletteItem = active.data.current?.isPaletteItem;

    if (activeId === overId) return;

    // If dragging a new item over a container
    if (isActiveAPaletteItem && over.data.current?.acceptsChildren) {
        setCanvasComponents(prev => {
           const newComponent: Component = {
                id: `${active.data.current?.type}-${Date.now()}`,
                type: active.data.current?.type,
                name: active.data.current?.name,
                props: initialProps[active.data.current?.type] || {},
                children: active.data.current?.type === 'container' ? [] : undefined
            };
            return addComponent(prev, newComponent, overId);
        });
        // We need to disable the active draggable palette item to avoid multiple additions
        active.data.current.isPaletteItem = false;
        active.id = `${active.data.current?.type}-${Date.now()}`;
    }

  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveComponent(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Add new component
    if (active.data.current?.isPaletteItem) {
        const newComponent: Component = {
            id: `${active.data.current.type}-${Date.now()}`,
            type: active.data.current.type,
            name: active.data.current.name,
            props: initialProps[active.data.current.type] || {},
            children: active.data.current.type === 'container' ? [] : undefined,
        };
        setCanvasComponents(prev => addComponent(prev, newComponent, overId === 'canvas-droppable' ? null : overId));
        setSelectedComponentId(newComponent.id);
        return;
    }
    
    // Move existing component
    if (activeId !== overId) {
        setCanvasComponents(prev => moveComponent(prev, activeId, overId));
    }
    
  }, []);

  function handleRemoveComponent(id: UniqueIdentifier) {
    if (selectedComponentId === id) {
        setSelectedComponentId(null);
    }
    setCanvasComponents(prev => removeComponent(prev, id));
  }

  function handleSelectComponent(id: UniqueIdentifier) {
    setSelectedComponentId(id);
  }
  
  function handleDeselect(e?: React.MouseEvent) {
      if(e) e.stopPropagation();
      setSelectedComponentId(null);
  }

  function handlePropsChange(id: UniqueIdentifier, newProps: any) {
    const update = (components: Component[]): Component[] => {
        return components.map(c => {
            if (c.id === id) {
                return { ...c, props: newProps };
            }
            if (c.children) {
                return { ...c, children: update(c.children) };
            }
            return c;
        });
    }
    setCanvasComponents(update);
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
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
        <main className="flex-1 p-4 bg-muted/20 overflow-y-auto" onClick={handleDeselect}>
            <DroppableContainer id="canvas-droppable" items={canvasComponents} onSelect={handleDeselect} isSelected={selectedComponentId === 'canvas-droppable'}/>
        </main>

        {/* Properties Panel */}
        <aside className="w-80 border-l p-4 bg-card overflow-y-auto">
          <PropertiesPanel selectedComponent={selectedComponent} onPropsChange={handlePropsChange} />
        </aside>
      </div>
      <DragOverlay>
        {activeComponent ? (
            <div className="border rounded-lg p-3 text-sm cursor-grabbing bg-card shadow-lg flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{activeComponent.name}</span>
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
