import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-4.1rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your application settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme-toggle" className="text-base">Theme</Label>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}