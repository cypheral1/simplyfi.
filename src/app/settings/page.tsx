
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

const themes = [
  { name: "Default", theme: "default", color: "#A020F0" },
  { name: "Ocean", theme: "ocean", color: "#1E90FF" },
  { name: "Forest", theme: "forest", color: "#228B22" },
  { name: "Sunset", theme: "sunset", color: "#FF4500" },
];

const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi (हिन्दी)' },
    { value: 'mr', label: 'Marathi (मराठी)' },
    { value: 'te', label: 'Telugu (తెలుగు)' },
    { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
    { value: 'es', label: 'Spanish (Español)' },
    { value: 'fr', label: 'French (Français)' },
]

const translations: Record<string, Record<string, string>> = {
    en: {
        settings: 'Settings',
        manageSettings: 'Manage your application settings.',
        appearance: 'Appearance',
        darkMode: 'Dark/Light Mode',
        colorScheme: 'Color Scheme',
        customColor: 'Custom Color',
        language: 'Language',
        appLanguage: 'App Language',
        save: 'Save',
        reset: 'Reset',
        chatHistory: 'Vibe Code Chat History',
        clearHistory: 'Clear History',
        areYouSure: 'Are you absolutely sure?',
        cannotBeUndone: 'This action cannot be undone. This will permanently delete your chat history.',
        cancel: 'Cancel',
        continue: 'Continue',
        noHistory: 'No chat history found.',
        settingsSaved: 'Settings Saved',
        settingsApplied: 'Your new settings have been applied.',
        historyCleared: 'Chat History Cleared',
        historyDeleted: 'Your Vibe Code conversation history has been deleted.'
    },
    hi: {
        settings: 'सेटिंग्स',
        manageSettings: 'अपने एप्लिकेशन सेटिंग्स प्रबंधित करें।',
        appearance: 'दिखावट',
        darkMode: 'डार्क/लाइट मोड',
        colorScheme: 'रंग योजना',
        customColor: 'कस्टम रंग',
        language: 'भाषा',
        appLanguage: 'ऐप भाषा',
        save: 'सहेजें',
        reset: 'रीसेट करें',
        chatHistory: 'वाइब कोड चैट इतिहास',
        clearHistory: 'इतिहास साफ़ करें',
        areYouSure: 'क्या आप बिल्कुल निश्चित हैं?',
        cannotBeUndone: 'यह क्रिया पूर्ववत नहीं की जा सकती। यह आपके चैट इतिहास को स्थायी रूप से हटा देगा।',
        cancel: 'रद्द करें',
        continue: 'जारी रखें',
        noHistory: 'कोई चैट इतिहास नहीं मिला।',
        settingsSaved: 'सेटिंग्स सहेजी गईं',
        settingsApplied: 'आपकी नई सेटिंग्स लागू कर दी गई हैं।',
        historyCleared: 'चैट इतिहास साफ़ किया गया',
        historyDeleted: 'आपका वाइब कोड वार्तालाप इतिहास हटा दिया गया है।'
    },
    es: {
        settings: 'Configuración',
        manageSettings: 'Gestiona la configuración de tu aplicación.',
        appearance: 'Apariencia',
        darkMode: 'Modo Oscuro/Claro',
        colorScheme: 'Esquema de Colores',
        customColor: 'Color Personalizado',
        language: 'Idioma',
        appLanguage: 'Idioma de la Aplicación',
        save: 'Guardar',
        reset: 'Restablecer',
        chatHistory: 'Historial de Chat de Vibe Code',
        clearHistory: 'Borrar Historial',
        areYouSure: '¿Estás absolutamente seguro?',
        cannotBeUndone: 'Esta acción no se puede deshacer. Esto eliminará permanentemente tu historial de chat.',
        cancel: 'Cancelar',
        continue: 'Continuar',
        noHistory: 'No se encontró historial de chat.',
        settingsSaved: 'Configuración Guardada',
        settingsApplied: 'Tu nueva configuración ha sido aplicada.',
        historyCleared: 'Historial de Chat Borrado',
        historyDeleted: 'Tu historial de conversaciones de Vibe Code ha sido eliminado.'
    },
    // Add other languages here...
    fr: {
        settings: 'Paramètres',
        manageSettings: 'Gérez les paramètres de votre application.',
        appearance: 'Apparence',
        darkMode: 'Mode Sombre/Clair',
        colorScheme: 'Palette de couleurs',
        customColor: 'Couleur personnalisée',
        language: 'Langue',
        appLanguage: 'Langue de l\'application',
        save: 'Enregistrer',
        reset: 'Réinitialiser',
        chatHistory: 'Historique des discussions de Vibe Code',
        clearHistory: 'Effacer l\'historique',
        areYouSure: 'Êtes-vous absolument certain(e) ?',
        cannotBeUndone: 'Cette action est irréversible. Cela supprimera définitivement votre historique de discussion.',
        cancel: 'Annuler',
        continue: 'Continuer',
        noHistory: 'Aucun historique de discussion trouvé.',
        settingsSaved: 'Paramètres enregistrés',
        settingsApplied: 'Vos nouveaux paramètres ont été appliqués.',
        historyCleared: 'Historique des discussions effacé',
        historyDeleted: 'Votre historique de conversation Vibe Code a été supprimé.'
    },
    mr: {
        settings: 'सेटिंग्ज',
        manageSettings: 'तुमच्या अनुप्रयोगाची सेटिंग्ज व्यवस्थापित करा.',
        appearance: 'स्वरूप',
        darkMode: 'गडद/प्रकाश मोड',
        colorScheme: 'रंग योजना',
        customColor: 'सानुकूल रंग',
        language: 'भाषा',
        appLanguage: 'अॅप भाषा',
        save: 'जतन करा',
        reset: 'रीसेट करा',
        chatHistory: 'वाइब कोड चॅट इतिहास',
        clearHistory: 'इतिहास साफ करा',
        areYouSure: 'तुम्ही पूर्णपणे निश्चित आहात का?',
        cannotBeUndone: 'ही क्रिया पूर्ववत केली जाऊ शकत नाही. हे तुमचा चॅट इतिहास कायमचा हटवेल.',
        cancel: 'रद्द करा',
        continue: 'सुरू ठेवा',
        noHistory: 'चॅट इतिहास आढळला नाही.',
        settingsSaved: 'सेटिंग्ज जतन केल्या',
        settingsApplied: 'तुमची नवीन सेटिंग्ज लागू केली आहेत.',
        historyCleared: 'चॅट इतिहास साफ केला',
        historyDeleted: 'तुमचा वाइब कोड संभाषण इतिहास हटवला गेला आहे.'
    },
    te: {
        settings: 'సెట్టింగ్‌లు',
        manageSettings: 'మీ అప్లికేషన్ సెట్టింగ్‌లను నిర్వహించండి.',
        appearance: 'స్వరూపం',
        darkMode: 'చీకటి/తేలికపాటి మోడ్',
        colorScheme: 'రంగు పథకం',
        customColor: 'అనుకూల రంగు',
        language: 'భాష',
        appLanguage: 'యాప్ భాష',
        save: 'సేవ్ చేయండి',
        reset: 'రీసెట్ చేయండి',
        chatHistory: 'వైబ్ కోడ్ చాట్ చరిత్ర',
        clearHistory: 'చరిత్రను క్లియర్ చేయండి',
        areYouSure: 'మీరు ఖచ్చితంగా ఖಚಿತంగా ఉన్నారా?',
        cannotBeUndone: 'ఈ చర్యను రద్దు చేయడం సాధ్యం కాదు. ఇది మీ చాట్ చరిత్రను శాశ్వతంగా తొలగిస్తుంది.',
        cancel: 'రద్దు చేయండి',
        continue: 'కొనసాగించండి',
        noHistory: 'చాట్ చరిత్ర కనుగొనబడలేదు.',
        settingsSaved: 'సెట్టింగ్‌లు సేవ్ చేయబడ్డాయి',
        settingsApplied: 'మీ కొత్త సెట్టింగ్‌లు వర్తింపజేయబడ్డాయి.',
        historyCleared: 'చాట్ చరిత్ర క్లియర్ చేయబడింది',
        historyDeleted: 'మీ వైబ్ కోడ్ సంభాషణ చరిత్ర తొలగించబడింది.'
    },
    kn: {
        settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        manageSettings: 'ನಿಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
        appearance: 'ಗೋಚರತೆ',
        darkMode: 'ಡಾರ್ಕ್/ಲೈಟ್ ಮೋಡ್',
        colorScheme: 'ಬಣ್ಣದ ಯೋಜನೆ',
        customColor: 'ಕಸ್ಟಮ್ ಬಣ್ಣ',
        language: 'ಭಾಷೆ',
        appLanguage: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
        save: 'ಉಳಿಸಿ',
        reset: 'ಮರುಹೊಂದಿಸಿ',
        chatHistory: 'ವೈಬ್ ಕೋಡ್ ಚಾಟ್ ಇತಿಹಾಸ',
        clearHistory: 'ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಿ',
        areYouSure: 'ನೀವು ಖಚಿತವಾಗಿ ಖಚಿತವಾಗಿದ್ದೀರಾ?',
        cannotBeUndone: 'ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂತಿರುಗಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಇದು ನಿಮ್ಮ ಚಾಟ್ ಇತಿಹಾಸವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ.',
        cancel: 'ರದ್ದುಮಾಡಿ',
        continue: 'ಮುಂದುವರಿಸಿ',
        noHistory: 'ಯಾವುದೇ ಚಾಟ್ ಇತಿಹಾಸ ಕಂಡುಬಂದಿಲ್ಲ.',
        settingsSaved: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ',
        settingsApplied: 'ನಿಮ್ಮ ಹೊಸ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಅನ್ವಯಿಸಲಾಗಿದೆ.',
        historyCleared: 'ಚಾಟ್ ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ',
        historyDeleted: 'ನಿಮ್ಮ ವೈಬ್ ಕೋಡ್ ಸಂಭಾಷಣೆ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಲಾಗಿದೆ.'
    },
     gu: {
        settings: 'સેટિંગ્સ',
        manageSettings: 'તમારી એપ્લિકેશન સેટિંગ્સ સંચાલિત કરો.',
        appearance: 'દેખાવ',
        darkMode: 'ડાર્ક/લાઇટ મોડ',
        colorScheme: 'રંગ યોજના',
        customColor: 'કસ્ટમ રંગ',
        language: 'ભાષા',
        appLanguage: 'એપ્લિકેશન ભાષા',
        save: 'સાચવો',
        reset: 'રીસેટ કરો',
        chatHistory: 'વાઇબ કોડ ચેટ ઇતિહાસ',
        clearHistory: 'ઇતિહાસ સાફ કરો',
        areYouSure: 'શું તમે ખાતરીપૂર્વક ખાતરી કરો છો?',
        cannotBeUndone: 'આ ક્રિયાને પૂર્વવત્ કરી શકાતી નથી. આ તમારા ચેટ ઇતિહાસને કાયમ માટે કાઢી નાખશે.',
        cancel: 'રદ કરો',
        continue: 'ચાલુ રાખો',
        noHistory: 'કોઈ ચેટ ઇતિહાસ મળ્યો નથી.',
        settingsSaved: 'સેટિંગ્સ સાચવવામાં આવી',
        settingsApplied: 'તમારી નવી સેટિંગ્સ લાગુ કરવામાં આવી છે.',
        historyCleared: 'ચેટ ઇતિહાસ સાફ થયો',
        historyDeleted: 'તમારો વાઇબ કોડ વાર્તાલાપ ઇતિહાસ કાઢી નાખવામાં આવ્યો છે.'
    }
};


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

  const [currentColorTheme, setCurrentColorTheme] = React.useState('default');
  const [customColor, setCustomColor] = React.useState(themes[0].color);
  const [language, setLanguage] = React.useState('en');
  
  const t = translations[language] || translations.en;

  // Load saved settings on initial render
  React.useEffect(() => {
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
    const savedCustomColor = localStorage.getItem('customColor') || themes.find(t => t.theme === savedColorTheme)?.color || themes[0].color;
    const savedLanguage = localStorage.getItem('language') || 'en';
    
    setCurrentColorTheme(savedColorTheme);
    setCustomColor(savedCustomColor);
    setLanguage(savedLanguage);
    
    if (savedColorTheme !== 'default') {
      document.documentElement.classList.add(`theme-${savedColorTheme}`);
    } else if(savedCustomColor) {
      applyCustomTheme(savedCustomColor, false);
    }
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
    toast({
      title: t.settingsSaved,
      description: t.settingsApplied,
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
        title: t.historyCleared,
        description: t.historyDeleted,
    })
  }
  
  return (
    <div className="flex justify-center items-start pt-16 h-[calc(100vh-4.1rem)]">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>{t.settings}</CardTitle>
          <CardDescription>{t.manageSettings}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">{t.appearance}</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">{t.darkMode}</Label>
              <ThemeToggle />
            </div>
            
            <div className="space-y-4">
              <Label>{t.colorScheme}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((t) => (
                  <div key={t.theme}>
                    <button
                      onClick={() => {
                          setCurrentColorTheme(t.theme);
                          setCustomColor(t.color);
                      }}
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
              <div className="flex items-center gap-4 pt-4">
                  <Label htmlFor="custom-color">{t.customColor}</Label>
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
            <h3 className="text-lg font-medium">{t.language}</h3>
             <div className="flex items-center justify-between">
                <Label htmlFor="language-select" className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    {t.appLanguage}
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
            <Button variant="outline" onClick={handleReset}>{t.reset}</Button>
            <Button onClick={handleSave}>{t.save}</Button>
          </div>

          <Separator />

           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{t.chatHistory}</Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={messages.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> {t.clearHistory}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.cannotBeUndone}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>{t.continue}</AlertDialogAction>
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
                    <p className="text-sm text-muted-foreground">{t.noHistory}</p>
                </div>
             )}
           </div>

        </CardContent>
      </Card>
    </div>
  );

    