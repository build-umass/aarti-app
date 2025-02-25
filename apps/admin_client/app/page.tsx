import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Welcome to Quiz Admin</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Quizzes
            </CardTitle>
            <CardDescription>Create and manage your quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Easily create, edit, and organize your quiz content.</p>
            <Link href="/quizzes">
              <Button>Manage Quizzes</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Resources
            </CardTitle>
            <CardDescription>Manage learning resources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Upload and organize educational materials.</p>
            <Link href="/resources">
              <Button>Manage Resources</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}