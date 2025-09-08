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

async function createShortSlug(longUrl: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) {
    throw new Error('Cloudflare KV credentials are not configured.');
  }

  const slug = Math.random().toString(36).substring(2, 8);
  const key = slug;
  const value = longUrl;
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'text/plain',
    },
    body: value,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cloudflare API Error:', errorText);
    throw new Error('Failed to create short link in Cloudflare KV.');
  }

  return slug;
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
    const slug = await createShortSlug(url);
    const shortUrl = `https://lnk.wv/${slug}`;

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
