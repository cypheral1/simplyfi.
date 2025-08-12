
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Check, Trash2, Bot, User, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useChatStore } from "@/stores/chat-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { languages } from "@/lib/translations";

const themes = [
  { name: "Default", theme: "default", color: "#A020F0" },
  { name: "Ocean", theme: "ocean", color: "#1E90FF" },
  { name: "Forest", theme: "forest", color: "#228B22" },
  { name: "Sunset", theme: "sunset", color: "#FF4500" },
];

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { messages, clearHistory } = useChatStore();
  const { t, language, setLanguage, isLoaded } = useTranslation();


  const [currentColorTheme, setCurrentColorTheme] = React.useState('default');
  const [customColor, setCustomColor] = React.useState(themes[0].color);
  
  // Load saved settings on initial render
  React.useEffect(() => {
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
    const savedCustomColor = localStorage.getItem('customColor') || themes.find(t => t.theme === savedColorTheme)?.color || themes[0].color;
    
    setCurrentColorTheme(savedColorTheme);
    setCustomColor(savedCustomColor);
    
    if (savedColorTheme !== 'default') {
      document.documentElement.classList.add(`theme-${savedColorTheme}`);
    } else if(savedCustomColor) {
      applyCustomTheme(savedCustomColor, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPredefinedTheme = (newTheme: string, save = true) => {
    // Remove custom theme styles
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary-foreground');
    document.documentElement.style.removeProperty('--ring');
    document.documentElement.style.removeProperty('--accent');
    
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset');
    
    if (newTheme !== 'default') {
      document.documentElement.classList.add(`theme-${newTheme}`);
    }
    
    // This is a bit of a workaround to persist the color theme choice with next-themes
    const currentIsDark = document.documentElement.classList.contains('dark');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    setTheme(currentIsDark ? 'dark' : 'light');
    if (theme === 'system') {
       setTheme(systemTheme);
       setTimeout(()=> setTheme('system'), 1);
    } else {
        // force re-render
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setTimeout(() => setTheme(theme || 'light'), 1);
    }

    if (save) {
      localStorage.setItem('colorTheme', newTheme);
      localStorage.removeItem('customColor');
    }
  }

  const applyCustomTheme = (color: string, save = true) => {
    const hsl = hexToHsl(color);
    if (hsl) {
      const { h, s, l } = hsl;
      document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
      document.documentElement.style.setProperty('--primary-foreground', l > 50 ? '222.2 47.4% 11.2%' : '210 40% 98%');
      document.documentElement.style.setProperty('--ring', `${h} ${s}% ${l}%`);
      document.documentElement.style.setProperty('--accent', `${h} 30% 90%`);

      // remove predefined theme classes
      document.documentElement.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset');
      
      if (save) {
        localStorage.setItem('customColor', color);
        localStorage.setItem('colorTheme', 'custom');
      }
    }
  }

  const handleSave = () => {
    if (currentColorTheme === 'custom') {
      applyCustomTheme(customColor);
    } else {
      applyPredefinedTheme(currentColorTheme);
    }
    localStorage.setItem('language', language);
    window.location.reload(); // to apply language changes globally
    toast({
      title: t.settings.settingsSaved,
      description: t.settings.settingsApplied,
    })
  }
  
  const handleReset = () => {
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
    const savedCustomColor = localStorage.getItem('customColor') || themes.find(t => t.theme === savedColorTheme)?.color || themes[0].color;
    const savedLanguage = localStorage.getItem('language') || 'en';
    
    setCurrentColorTheme(savedColorTheme);
    setCustomColor(savedCustomColor);
    setLanguage(savedLanguage);

    if (savedColorTheme === 'custom') {
        applyCustomTheme(savedCustomColor, false);
    } else {
        applyPredefinedTheme(savedColorTheme, false);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    toast({
        title: t.settings.historyCleared,
        description: t.settings.historyDeleted,
    })
  }
  
  if (!isLoaded) {
    return null; // Or a loading spinner
  }
  
  return (
    <div className="flex justify-center items-start pt-16 h-[calc(100vh-4.1rem)]">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>{t.settings.settings}</CardTitle>
          <CardDescription>{t.settings.manageSettings}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">{t.settings.appearance}</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">{t.settings.darkMode}</Label>
              <ThemeToggle />
            </div>
            
            <div className="space-y-4">
              <Label>{t.settings.colorScheme}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((th) => (
                  <div key={th.theme}>
                    <button
                      onClick={() => {
                          setCurrentColorTheme(th.theme);
                          setCustomColor(th.color);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 p-1 w-full",
                        currentColorTheme === th.theme ? "border-primary" : "border-muted"
                      )}
                    >
                      <div className="flex items-center gap-2 py-2">
                         <div className={cn("w-6 h-6 rounded-full",
                           th.theme === 'default' && 'bg-[#A020F0]',
                           th.theme === 'ocean' && 'bg-[#1E90FF]',
                           th.theme === 'forest' && 'bg-[#228B22]',
                           th.theme === 'sunset' && 'bg-[#FF4500]',
                         )} />
                         <span className="text-sm font-medium">{th.name}</span>
                         {currentColorTheme === th.theme && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-4">
                  <Label htmlFor="custom-color">{t.settings.customColor}</Label>
                  <Input
                      id="custom-color"
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                          setCustomColor(e.target.value)
                          setCurrentColorTheme('custom')
                      }}
                      className="w-20 h-10 p-1"
                  />
              </div>
            </div>
          </div>
          
          <Separator />
          
           <div className="space-y-6">
            <h3 className="text-lg font-medium">{t.settings.language}</h3>
             <div className="flex items-center justify-between">
                <Label htmlFor="language-select" className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    {t.settings.appLanguage}
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[200px]" id="language-select">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
           </div>


          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleReset}>{t.settings.reset}</Button>
            <Button onClick={handleSave}>{t.settings.save}</Button>
          </div>

          <Separator />

           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{t.settings.chatHistory}</Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={messages.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> {t.settings.clearHistory}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.settings.areYouSure}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.settings.cannotBeUndone}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.settings.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>{t.settings.continue}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
             </div>
             {messages.length > 0 ? (
                <ScrollArea className="h-64 w-full rounded-md border">
                    <div className="p-4 space-y-4">
                        {messages.map((message, index) => (
                             <div key={index} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>{message.role === 'user' ? <User size={20} /> : <Bot size={20} />}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold capitalize">{message.role}</p>
                                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-code">
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
             ) : (
                <div className="flex items-center justify-center h-24 rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">{t.settings.noHistory}</p>
                </div>
             )}
           </div>

        </CardContent>
      </Card>
    </div>
  );
}
