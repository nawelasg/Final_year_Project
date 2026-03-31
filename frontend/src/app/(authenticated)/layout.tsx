'use client';
import { FileText, LogOut, Moon, Sun, Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { AiChatbotWidget } from '~/components/ai-chatbot-widget'; // Import the widget

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
    router.refresh();
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center justify-center">
          <FileText className="h-6 w-6 text-primary" /><span className="ml-2 font-semibold">LegalPro AI</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          {/* This is the link to the dedicated chatbot page */}
          <Link href="/chatbot"><Button variant="ghost" size="icon" aria-label="AI Chatbot Page"><Bot className="h-5 w-5" /></Button></Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Toggle theme"><Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /><Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
      {/* This is the floating chatbot widget */}
      <AiChatbotWidget />
    </div>
  );
}
