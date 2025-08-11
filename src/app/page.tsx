import ChatInterface from '@/components/chat-interface';

export default function Home() {
  return (
    <div className="flex flex-col h-[calc(100vh-4.1rem)] bg-background">
      <main className="flex-1 overflow-auto">
        <ChatInterface />
      </main>
    </div>
  );
}