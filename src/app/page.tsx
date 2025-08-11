import Header from '@/components/header';
import VibeCoder from '@/components/vibe-coder';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <VibeCoder />
      </main>
    </div>
  );
}
