"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const themes = [
  { name: "Default", theme: "default" },
  { name: "Ocean", theme: "ocean" },
  { name: "Forest", theme: "forest" },
  { name: "Sunset", theme: "sunset" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    const currentIsDark = document.documentElement.classList.contains('dark');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-default', 'theme-ocean', 'theme-forest', 'theme-sunset');
    
    if (newTheme !== 'default') {
      document.documentElement.classList.add(`theme-${newTheme}`);
    }

    // This is a bit of a workaround to persist the color theme choice
    // separate from the light/dark mode choice.
    localStorage.setItem('colorTheme', newTheme);
    
    // Force re-render with correct theme class
    setTheme(currentIsDark ? 'dark' : 'light');
    if (theme === 'system') {
       setTheme(systemTheme);
       setTimeout(()=> setTheme('system'), 1);
    }
  };

  React.useEffect(() => {
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
    if (savedColorTheme !== 'default') {
      document.documentElement.classList.add(`theme-${savedColorTheme}`);
    }
  }, []);
  
  const currentColorTheme = React.useMemo(() => {
    if (typeof window === 'undefined') return 'default';
    return localStorage.getItem('colorTheme') || 'default'
  }, [theme]);

  return (
    <div className="flex justify-center items-start pt-16 h-[calc(100vh-4.1rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your application settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="text-base">Dark/Light Mode</Label>
            <ThemeToggle />
          </div>
          
          <div className="space-y-4">
            <Label className="text-base">Color Scheme</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themes.map((t) => (
                <div key={t.theme}>
                  <button
                    onClick={() => handleThemeChange(t.theme)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-md border-2 p-1 w-full",
                      currentColorTheme === t.theme ? "border-primary" : "border-muted"
                    )}
                  >
                    <div className="flex items-center gap-2 py-2">
                       <div className={cn("w-6 h-6 rounded-full",
                         t.theme === 'default' && 'bg-[#A020F0]',
                         t.theme === 'ocean' && 'bg-[#1E90FF]',
                         t.theme === 'forest' && 'bg-[#228B22]',
                         t.theme === 'sunset' && 'bg-[#FF4500]',
                       )} />
                       <span className="text-sm font-medium">{t.name}</span>
                       {currentColorTheme === t.theme && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
