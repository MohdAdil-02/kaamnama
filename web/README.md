# Kaamnama Web (apps/web)

काम + नामा: a written record of work done. React 18 + Vite + Tailwind 3 + React Router 6 + Zustand + Axios.

Run and test instructions (VS Code, Hinglish): see **GUIDE.md**.

## Quick start
```bash
npm install
npm run dev        # http://localhost:5173  (proxies /api to VITE_PROXY_TARGET)
```

## What is built (mapped to the product layout)
| Product section | In the app |
|---|---|
| 4. Job Receipt | `CreateReceipt` (customerPhone, workType, pincode, amount, photoBefore/After, paymentReference, durationType, orgId) |
| 5. Verification ladder T0-T3 | `utils/tiers.js`, `TierBadge`, `TierBreakdown`, `TierLadder`, tier filter on receipts |
| 6. Organizations (Stage 2) | org dashboard, members with role and dates, worker "My organizations", privacy notes |
| 7. Verified directory (Stage 2) | skill + pincode/radius search, tier-ranked results, direct call/WhatsApp, no hiring flow |
| 8. Public profile | `PublicProfile` with the verified / payment-linked / repeat / months active / e-Shram summary, QR and share |
| 9. Workflow | WhatsApp share of the confirmation link, zero-install customer flow (`/confirm`, `/rate`) |
| 13. Trade + Education | `utils/verticals.js` swaps labels only; onboarding branch in `SelectCategory` |
| Data ownership | Settings: deletion request with typed confirmation |

## Extras
Hindi/English toggle, skeleton loaders, error boundary, offline banner, image compression before upload, CSV export on admin lists, notifications with mark-as-read, print-friendly receipts, feature flags in `.env`, unit tests, ESLint/Prettier, Docker + nginx.

## Expected API shapes (adjust the pages if yours differ)
- Lists: `{ data: { items: [], pages } }` (a plain array also works)
- verify-otp: `{ data: { token, user: { role, name, vertical, categorySelected } } }`
- receipt: `_id, workType, pincode, amount, status, verificationTier ('T0'..'T3'), photoBefore, photoAfter, paymentReference, durationType, org, rating { value, tags, comment }, createdAt, confirmedAt, customerPhone`
- worker dashboard: `verifiedJobs, paymentLinkedJobs, repeatCustomers, avgRating, pendingReceipts, tierCounts { T0..T3 }, monthly [{label,value}], recentReceipts[], trustScore, tier, slug`
- public profile: `name, vertical, category, city, pincode, verifiedJobs, paymentLinkedJobs, repeatCustomers, monthsActive, topWorkTypes[], eShramLinked, tierCounts, trustScore, avgRating, phone`
- trust score: `{ score, tier, tierCounts, breakdown: [{ label, points, max }] }`
- admin stats: `{ users, workers, organizations, receipts }`; reports: `{ receiptsByStatus, workersByCategory, signupsByMonth }` each `[{ label, value }]`

Roles and receipt statuses live in `src/utils/constants.js`; verticals in `src/utils/verticals.js`.
