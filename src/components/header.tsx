
import { CodeXml, LayoutTemplate, Settings, Bot, Waypoints } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <CodeXml className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground font-headline">
              VibeCode
            </h1>
          </Link>
          <nav className="flex items-center gap-4">
             <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <Bot className="h-5 w-5" />
              <span>Vibe Code Mode</span>
            </Link>
            <Link href="/ui-builder" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <LayoutTemplate className="h-5 w-5" />
              <span>UI Builder</span>
            </Link>
             <Link href="/ai-workflows" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <Waypoints className="h-5 w-5" />
              <span>AI Workflows</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
