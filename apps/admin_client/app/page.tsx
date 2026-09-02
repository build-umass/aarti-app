'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, HelpCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const API_BASE_URL = 'http://localhost:3002';

function useCount(endpoint: string) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await response.json();
        if (!cancelled) {
          setValue(Array.isArray(data) ? data.length : 0);
          setState('ok');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { state, value };
}

function StatCard({
  href,
  icon: Icon,
  title,
  description,
  count,
  state,
  delay,
}: {
  href: string;
  icon: typeof HelpCircle;
  title: string;
  description: string;
  count: number | null;
  state: 'loading' | 'ok' | 'error';
  delay: string;
}) {
  return (
    <Card className={`rise ${delay} transition-shadow hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <span className="font-display text-4xl font-semibold tabular-nums tracking-tight">
            {state === 'loading' ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : state === 'error' ? (
              <span
                className="text-lg text-muted-foreground"
                title="Backend endpoint not available"
              >
                —
              </span>
            ) : (
              count
            )}
          </span>
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Manage
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const quizzes = useCount('/quiz');
  const resources = useCount('/resource');

  return (
    <div>
      <div className="rise mb-10">
        <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          Content studio
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Everything learners see in the Aarti app starts here. Keep quizzes and resources current,
          and the app picks them up on its next run.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard
          href="/quizzes"
          icon={HelpCircle}
          title="Quizzes"
          description="Questions, options, and feedback per topic."
          count={quizzes.value}
          state={quizzes.state}
          delay="rise-1"
        />
        <StatCard
          href="/resources"
          icon={BookOpen}
          title="Resources"
          description="Supporting material for the resource library."
          count={resources.value}
          state={resources.state}
          delay="rise-2"
        />
      </div>

      <div className={`rise rise-3 mt-10 rounded-xl border border-pink-soft bg-pink-soft/50 p-5`}>
        <h2 className="font-display text-base font-semibold tracking-tight">Getting started</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Pick a topic and add quiz questions with clear feedback.</li>
          <li>Publish resources learners can read from the Resources tab.</li>
          <li>Open the Aarti app to see everything live.</li>
        </ol>
      </div>
    </div>
  );
}
