import ChatInterface from '@/components/chat-interface';

export default function Home() {
  return (
    <div className="h-[calc(100vh-4.1rem)] w-full flex items-center justify-center bg-dotted-pattern">
      <main className="flex-1 overflow-auto max-w-5xl w-full h-[calc(100%-2rem)]">
        <ChatInterface />
      </main>
    </div>
  );
}
