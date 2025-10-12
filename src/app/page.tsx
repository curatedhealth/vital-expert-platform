'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, BookOpen, Brain, Workflow, BarChart3 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // AUTH DISABLED - Auto-redirect to dashboard
  useEffect(() => {
    console.log('🔓 AUTH DISABLED - Auto-redirecting from home to dashboard');
    router.push('/dashboard');
  }, [router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            VITAL Expert Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Strategic Intelligence Platform for Healthcare Organizations. 
            Scale expertise instantly, test strategies safely, and access 136+ specialized advisors.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="outline">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>AI Chat</CardTitle>
              <CardDescription>
                Interactive conversations with specialized healthcare AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full">Start Chatting</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>AI Agents</CardTitle>
              <CardDescription>
                Access 136+ specialized healthcare advisors and experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/agents">
                <Button className="w-full">Browse Agents</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Comprehensive healthcare knowledge and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/knowledge">
                <Button className="w-full">Explore Knowledge</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Ask Expert Panel</CardTitle>
              <CardDescription>
                Get insights from expert panels and advisory boards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/ask-panel">
                <Button className="w-full">Ask Panel</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Workflow className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Workflows</CardTitle>
              <CardDescription>
                Streamline healthcare processes with automated workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/workflows">
                <Button className="w-full">View Workflows</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track performance and insights across all interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg inline-block">
            ✅ Platform is operational and ready for testing
          </div>
        </div>
      </div>
    </div>
  );
}