'use client';

import { useState } from 'react';
import { UrlShortenerForm } from '@/components/url-shortener-form';
import { ShortLinkCard } from '@/components/shortlink-card';
import { Logo } from '@/components/icons';
import type { ShortenState } from '@/app/actions';

export default function Home() {
  const [result, setResult] = useState<ShortenState | null>(null);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <header className="text-center space-y-2">
            <div className="inline-flex items-center gap-3">
              <Logo className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                LinkWave
              </h1>
            </div>
            <p className="text-muted-foreground">
              Một ứng dụng rút gọn link hiện đại, nhanh chóng và thông minh.
            </p>
          </header>

          <div className="space-y-4">
            <UrlShortenerForm onResult={setResult} />
            {result?.shortUrl && <ShortLinkCard {...result} />}
          </div>

          <footer className="text-center text-sm text-muted-foreground">
            <p>Tác giả: lowng - CHTCoder</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
