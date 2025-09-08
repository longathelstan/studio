'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { createShortLink, type ShortenState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Wand2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UrlShortenerFormProps {
  onResult: (result: ShortenState | null) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang xử lý...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Rút gọn
        </>
      )}
    </Button>
  );
}

export function UrlShortenerForm({ onResult }: UrlShortenerFormProps) {
  const initialState: ShortenState = {};
  const [state, formAction] = useFormState(createShortLink, initialState);
  const { toast } = useToast();

  useEffect(() => {
    onResult(state.shortUrl ? state : null);

    if (state.error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: state.error,
      });
    }
    
    if (state.fieldErrors?.url) {
       toast({
        variant: "destructive",
        title: "URL không hợp lệ",
        description: state.fieldErrors.url[0],
      });
    }

  }, [state, onResult, toast]);
  
  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="url">URL dài</Label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com/long-url-to-be-shortened"
            required
            className="pl-10"
            aria-describedby='url-error'
          />
        </div>
        {state.fieldErrors?.url && (
          <p id="url-error" className="text-sm text-destructive mt-1">{state.fieldErrors.url[0]}</p>
        )}
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
        <div className="space-y-0.5">
          <Label htmlFor="generateQr">Tạo mã QR</Label>
          <p className="text-[0.8rem] text-muted-foreground">
            Tự động tạo mã QR cho link rút gọn.
          </p>
        </div>
        <Switch id="generateQr" name="generateQr" defaultChecked />
      </div>

      <SubmitButton />
    </form>
  );
}
