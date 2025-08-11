import { CodeXml } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <CodeXml className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
            Vibe Coder
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
