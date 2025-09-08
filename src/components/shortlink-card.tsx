'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, Download } from 'lucide-react';
import type { ShortenState } from '@/app/actions';

export function ShortLinkCard({ shortUrl, qrCodeDataUri }: ShortenState) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: 'Đã sao chép!',
      description: 'Link rút gọn đã được sao chép vào clipboard.',
    });
  };

  const handleDownload = () => {
    if (!qrCodeDataUri) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUri;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!shortUrl) return null;

  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle>Link của bạn đã sẵn sàng!</CardTitle>
        <CardDescription>Sao chép link rút gọn hoặc tải mã QR.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full items-center space-x-2">
          <Input value={shortUrl} readOnly aria-label="Shortened URL"/>
          <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Sao chép link">
            <ClipboardCopy className="h-4 w-4" />
          </Button>
        </div>
        {qrCodeDataUri && (
          <div className="flex flex-col items-center gap-4 rounded-lg border bg-secondary/50 p-4">
            <Image
              src={qrCodeDataUri}
              alt="QR Code"
              width={200}
              height={200}
              className="rounded-md bg-white p-2"
              data-ai-hint="qr code"
            />
            <Button onClick={handleDownload} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Tải xuống mã QR
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
