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

  const { generateQr } = validatedFields.data;

  try {
    // Simulate URL shortening
    const shortUrl = `https://lnk.wv/${Math.random().toString(36).substring(2, 8)}`;

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
    return {
      error: 'Đã xảy ra lỗi khi tạo link rút gọn. Vui lòng thử lại.',
    };
  }
}
