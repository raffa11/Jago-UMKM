# Jago UMKM - Project Blueprint

## Vision
A high-performance, mobile-first financial management app for Indonesian SMEs (UMKM). The aesthetic is **Clean Fintech** (Dark mode with Neon Lime accents, focusing on precise typography and consistent spacing).

## Architecture
- **Framework**: React 18 + Vite
- **Database/Auth**: Firebase (Firestore & Google Auth)
- **Styling**: Tailwind CSS (Inter & Poppins fonts)
- **Animations**: Framer Motion (motion/react)
- **Charts**: Recharts

## Data Model (Firestore)
- `userProfiles/{userId}`: Business settings, currency choice, and active branch tracking.
- `branches/{branchId}`: Multi-branch support. Each document belongs to a `userId`.
- `transactions/{transId}`: Financial records. Linked to `branchId` and `userId`.
- `products/{prodId}`: Inventory management. Tracks stock, cost, and price.
- `customers/{custId}`: Simple CRM for tracking debt and total spending.
- `invoices/{invId}`: Professional sales records. Automatically updates stock and customer balances.

## Rules for AI Assistants
1. **Security First**: Every Firestore query MUST include `where('userId', '==', user.uid)` and `where('branchId', '==', branchId)` to comply with security rules.
2. **Handle Errors**: Use the `handleFirestoreError` utility for all database operations.
3. **Design Language**: 
   - Background: `#0A0A0B` (Dark background)
   - Accent: `#39FF14` (Neon Lime)
   - Layout: Use `card-fintech` class for consistently styled containers.
   - Typography: Use **Poppins** for Headings (Title Case) and **Inter** for Body/Labels (Sentence case).
   - Icons: Use `lucide-react` exclusively.
4. **PWA**: The app is designed to be installable. Maintain standard manifest properties.

## Tech Stack specifics
- Path aliases: `@/` for `src/`
- Utility: `doc`, `collection`, `query`, `onSnapshot`, `runTransaction` are standard.
- AI Service: `getFinancialInsights` uses Gemini Flash via `aiService.ts`.
