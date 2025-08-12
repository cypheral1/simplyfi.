
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Plus, Workflow, MessagesSquare, Code, Settings2, Folder, FileText, LifeBuoy, Search } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const workflowTemplates = [
    { title: "Customer Support Bot", description: "Automatically answer customer questions.", icon: <MessagesSquare className="w-5 h-5" /> },
    { title: "Content Generation", description: "Generate blog posts or marketing copy.", icon: <FileText className="w-5 h-5" /> },
    { title: "Code Assistant", description: "Help developers write and debug code.", icon: <Code className="w-5 h-5" /> },
];

const aiSteps = [
    { title: "Start Trigger", description: "Define how the workflow starts (e.g., API call, schedule).", icon: <Bot className="w-8 h-8 text-primary" />, color: "bg-green-100 dark:bg-green-900/30" },
    { title: "Run Prompt", description: "Generate text with a specified model and prompt.", icon: <FileText className="w-8 h-8 text-primary" />, color: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Use Tool", description: "Integrate with external APIs or services.", icon: <Workflow className="w-8 h-8 text-primary" />, color: "bg-yellow-100 dark:bg-yellow-900/30" },
    { title: "Conditional Logic", description: "Branch the workflow based on conditions.", icon: <Settings2 className="w-8 h-8 text-primary" />, color: "bg-purple-100 dark:bg-purple-900/30" },
];


export default function AgentBuilderPage() {
  return (
    <div className="flex h-[calc(100vh-4.1rem)] bg-background text-foreground">
        <Sidebar collapsible="icon" side="left" variant="sidebar" className="group" defaultOpen={true}>
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
      <main className="flex-1 flex flex-col p-4 bg-muted/20 overflow-y-auto">
         <div className="bg-card border rounded-lg p-3 mb-4">
             <h2 className="text-lg font-semibold mb-2">AI Steps</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {aiSteps.map(step => (
                     <Card key={step.title} className={`p-3 cursor-grab hover:shadow-md transition-shadow ${step.color}`}>
                        <div className="flex flex-col items-center text-center gap-2">
                            {step.icon}
                            <span className="font-semibold text-sm">{step.title}</span>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                    </Card>
                ))}
             </div>
         </div>

        {/* Canvas Area */}
        <div className="flex-1 w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
                <Plus className="mx-auto h-8 w-8" />
                <p>Drag AI steps here to build a workflow</p>
            </div>
        </div>
      </main>

      {/* Properties Panel */}
      <aside className="w-80 border-l p-4 bg-card overflow-y-auto hidden lg:block">
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
      </aside>
    </div>
  );
}
