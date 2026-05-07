import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";
import { format } from "date-fns";

/**
 * CRITICAL: Do NOT initialize the AI SDK at module-import time.
 * If the API key is missing (common in APK builds without .env),
 * it throws before React mounts, causing an unrecoverable blank white screen.
 * Instead, initialize lazily inside the function with proper null checks.
 */
let _aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (_aiInstance) return _aiInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    console.warn('[aiService] GEMINI_API_KEY not available. AI features disabled.');
    return null;
  }

  try {
    _aiInstance = new GoogleGenAI({ apiKey });
    return _aiInstance;
  } catch (err) {
    console.error('[aiService] Failed to initialize GoogleGenAI:', err);
    return null;
  }
}

export async function getFinancialInsights(transactions: Transaction[], businessName: string) {
  if (transactions.length === 0) return "Sobat Jago, kumpulkan beberapa data transaksi terlebih dahulu agar saya bisa menganalisis ritme bisnis cabang ini.";

  const ai = getAI();
  if (!ai) {
    return "Fitur AI belum tersedia. Pastikan GEMINI_API_KEY dikonfigurasi dengan benar.";
  }

  const transactionSummary = transactions.slice(0, 50).map(t => ({
    date: format(t.date.toDate(), 'yyyy-MM-dd'),
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description
  }));

  const prompt = `
    Anda adalah 'Jago AI', asisten keuangan cerdas untuk UMKM Indonesia. 
    Bisnis: ${businessName}
    Data Transaksi Cabang: ${JSON.stringify(transactionSummary)}
    
    Berikan analisis singkat (maksimal 3 poin) yang sangat tajam dan praktis dalam Bahasa Indonesia.
    Gunakan gaya bahasa modern, profesional, dan 'to-the-point'.
    Fokus pada:
    - Kesehatan arus kas di cabang ini.
    - Peringatan jika ada pengeluaran yang tidak efisien.
    - Peluang pendapatan berdasarkan tren kategori.
    
    Jangan berikan pembukaan bertele-tele. Langsung berikan poin kuncinya.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Tidak dapat menghasilkan wawasan saat ini.";
  }
}
