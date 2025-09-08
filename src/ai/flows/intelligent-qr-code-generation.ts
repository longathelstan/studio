'use server';

/**
 * @fileOverview A flow that intelligently determines if a QR code is useful for a given URL and generates it if needed.
 *
 * - intelligentQrCodeGeneration - A function that generates a QR code for a URL if deemed useful.
 * - IntelligentQrCodeInput - The input type for the intelligentQrCodeGeneration function.
 * - IntelligentQrCodeOutput - The return type for the intelligentQrCodeGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentQrCodeInputSchema = z.object({
  shortUrl: z.string().describe('The shortened URL to potentially generate a QR code for.'),
});
export type IntelligentQrCodeInput = z.infer<typeof IntelligentQrCodeInputSchema>;

const IntelligentQrCodeOutputSchema = z.object({
  qrCodeDataUri: z.string().optional().describe('The QR code data URI, if generated.'),
  reason: z.string().describe('The reason why the QR code was or was not generated.'),
});
export type IntelligentQrCodeOutput = z.infer<typeof IntelligentQrCodeOutputSchema>;

export async function intelligentQrCodeGeneration(input: IntelligentQrCodeInput): Promise<IntelligentQrCodeOutput> {
  return intelligentQrCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'qrCodeDecisionPrompt',
  input: {schema: IntelligentQrCodeInputSchema},
  output: {schema: z.object({shouldGenerate: z.boolean().describe('Whether a QR code should be generated.')})},
  prompt: `You are an expert in determining the usefulness of QR codes for shortened URLs.
  A user has a shortened URL: {{{shortUrl}}}.
  Determine if a QR code would be useful for this URL. Consider factors such as the complexity and length of the URL.
  If the URL is easily typable or memorable, a QR code may not be necessary. Respond with only a JSON object indicating whether a QR code should be generated.
  `,
});

const generateQrCode = ai.definePrompt({
  name: 'generateQrCodePrompt',
  input: {schema: IntelligentQrCodeInputSchema},
  output: {schema: z.string().describe('The QR code data URI.')},
  prompt: `You are generating a QR code for the following URL: {{{shortUrl}}}. Please respond with the data URI of the generated QR code.
  Do not respond with anything but the data URI.
  `,
});

const intelligentQrCodeFlow = ai.defineFlow(
  {
    name: 'intelligentQrCodeFlow',
    inputSchema: IntelligentQrCodeInputSchema,
    outputSchema: IntelligentQrCodeOutputSchema,
  },
  async input => {
    const {output: decision} = await prompt(input);

    if (decision && decision.shouldGenerate) {
      const {output: qrCodeDataUri} = await generateQrCode(input);
      return {
        qrCodeDataUri: qrCodeDataUri!,
        reason: 'QR code generated because the URL was complex and not easily typable.',
      };
    } else {
      return {
        qrCodeDataUri: undefined,
        reason: 'QR code not generated because the URL was simple and easily typable.',
      };
    }
  }
);
