'use server';

import { z } from 'zod';
import { intelligentQrCodeGeneration } from '@/ai/flows/intelligent-qr-code-generation';

const CreateShortLinkSchema = z.object({
  url: z.string().url({ message: 'Vui lòng nhập một URL hợp lệ.' }),
  generateQr: z.boolean(),
});

export interface ShortenState {
  shortUrl?: string;
  qrCodeDataUri?: string | null;
  reason?: string | null;
  error?: string | null;
  fieldErrors?: {
    url?: string[];
  };
}

async function createShortLinkWithCustomAPI(longUrl: string): Promise<string> {
  const apiUrl = 'https://l.longathelstan.xyz/'; // Your API endpoint

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ longUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định từ API' }));
    throw new Error(errorData.error || `Lỗi API: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.shortUrl) {
    throw new Error('Phản hồi từ API không chứa shortUrl.');
  }

  return data.shortUrl;
}


export async function createShortLink(
  prevState: ShortenState,
  formData: FormData
): Promise<ShortenState> {
  const rawFormData = {
    url: formData.get('url'),
    generateQr: formData.get('generateQr') === 'on',
  };

  const validatedFields = CreateShortLinkSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { url, generateQr } = validatedFields.data;

  try {
    const shortUrl = await createShortLinkWithCustomAPI(url);

    if (generateQr) {
      const qrResult = await intelligentQrCodeGeneration({ shortUrl });
      return {
        shortUrl,
        qrCodeDataUri: qrResult.qrCodeDataUri,
        reason: qrResult.reason,
      };
    }

    return {
      shortUrl,
    };
  } catch (e) {
    console.error(e);
    // Check if e is an instance of Error before accessing e.message
    const errorMessage = e instanceof Error ? e.message : 'Đã xảy ra lỗi không xác định.';
    return {
      error: `Đã xảy ra lỗi khi tạo link rút gọn: ${errorMessage}. Vui lòng thử lại.`,
    };
  }
}
