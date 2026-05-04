import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";
import { format } from "date-fns";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getFinancialInsights(transactions: Transaction[], businessName: string) {
  if (transactions.length === 0) return "No transaction data available yet to provide insights.";

  const transactionSummary = transactions.slice(0, 50).map(t => ({
    date: format(t.date.toDate(), 'yyyy-MM-dd'),
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description
  }));

  const prompt = `
    You are a professional financial advisor for SMEs. 
    Business Name: ${businessName}
    Recent Transactions: ${JSON.stringify(transactionSummary)}
    
    Based on this data, provide 3 concise, actionable financial insights or recommendations for the business owner.
    Focused on: 
    1. Cash flow management
    2. Expense optimization
    3. Revenue trends
    
    Keep the tone encouraging, professional, and simple.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Unable to generate insights at this moment.";
  }
}
