"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// A simplified list of components the user could drag.
const availableComponents = [
  { id: 'button', name: 'Button' },
  { id: 'card', name: 'Card' },
  { id: 'input', name: 'Input' },
  { id: 'h1', name: 'Heading 1' },
  { id: 'p', name: 'Paragraph' },
];

export default function UiBuilderPage() {
  return (
    <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
      {/* Component Palette */}
      <aside className="w-64 border-r p-4 space-y-4">
        <h2 className="text-lg font-semibold">Components</h2>
        <div className="space-y-2">
          {availableComponents.map(comp => (
            <div key={comp.id} className="border rounded-lg p-3 text-sm cursor-grab bg-card hover:bg-accent">
              {comp.name}
            </div>
          ))}
        </div>
      </aside>

      {/* Canvas Area */}
      <main className="flex-1 p-4">
        <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <h3 className="text-xl font-semibold">Drag and Drop UI Builder</h3>
                <p>This is a placeholder for the canvas.</p>
                <p className="text-sm mt-2">(Feature coming soon!)</p>
            </div>
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
  );
}
