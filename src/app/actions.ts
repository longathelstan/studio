'use server';

import { z } from 'zod';
import QRCode from 'qrcode';

const CreateShortLinkSchema = z.object({
  url: z.string().url({ message: 'Vui lòng nhập một URL hợp lệ.' }),
  customAlias: z.string().optional(),
  generateQr: z.boolean(),
});

export interface ShortenState {
  shortUrl?: string;
  qrCodeDataUri?: string | null;
  error?: string | null;
  fieldErrors?: {
    url?: string[];
    customAlias?: string[];
  };
}

async function createShortLinkWithCustomAPI(longUrl: string, customAlias?: string): Promise<string> {
  const apiUrl = 'https://l.longathelstan.xyz/'; // Your API endpoint

  const body: { longUrl: string; customAlias?: string } = { longUrl };
  if (customAlias) {
    body.customAlias = customAlias;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
    customAlias: formData.get('customAlias') || undefined,
    generateQr: formData.get('generateQr') === 'on',
  };

  const validatedFields = CreateShortLinkSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { url, customAlias, generateQr } = validatedFields.data;

  try {
    const shortUrl = await createShortLinkWithCustomAPI(url, customAlias);
    let qrCodeDataUri: string | undefined = undefined;

    if (generateQr) {
      qrCodeDataUri = await QRCode.toDataURL(shortUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 200,
      });
    }

    return {
      shortUrl,
      qrCodeDataUri,
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
