import { CodeXml, LayoutTemplate, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <CodeXml className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
              Vibe Coder
            </h1>
          </Link>
          <Link href="/ui-builder" className="flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
              UI Builder
            </h1>
          </Link>
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
