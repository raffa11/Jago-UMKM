import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";
import { format } from "date-fns";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getFinancialInsights(transactions: Transaction[], businessName: string) {
  if (transactions.length === 0) return "Sobat Jago, kumpulkan beberapa data transaksi terlebih dahulu agar saya bisa menganalisis ritme bisnis cabang ini.";

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
