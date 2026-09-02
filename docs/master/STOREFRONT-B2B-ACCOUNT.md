# Storefront B2B Trade Account & Conversations

**Version:** 1.0  
**Last updated:** 9 August 2026  
**Maintainers:** Edit this `.md` first, then regenerate `.docx` (see §8).

**Related docs:** `B2B-QUOTE-ADMIN.md` (admin API, backlog P1-1), `PROJECT-STRUCTURE.md` (§3.1)

---

## 1. Overview

Logged-in trade customers access the B2B portal under **`/{countryCode}/account/trade/*`**. Features are gated by B2B settings (`conversations_enabled`, `quotes_enabled`, etc.) fetched from `GET /store/b2b/settings`.

| Route | Purpose |
|---|---|
| `/account/trade` | Trade overview (company, counts, quick links) |
| `/account/trade/quotes` | Submitted quote list |
| `/account/trade/quotes/[id]` | Quote detail + line items + **quote messaging** |
| `/account/trade/messages` | Conversation list + **New message** |
| `/account/trade/messages/[id]` | Thread view + reply |
| `/account/trade/approvals` | Review pending orders; approvers can approve/reject |
| `/register-trade` | Trade account registration (email verify flow) |

**Navigation:** `apps/storefront/src/lib/b2b/account-nav.ts` — items hidden when feature flag is `false`.

---

## 2. Conversations UI (P1-1 — Done)

### 2.1 Messages list

**Route:** `/account/trade/messages`  
**Page:** `apps/storefront/src/app/[countryCode]/(main)/account/@dashboard/trade/messages/page.tsx`

| Feature | Implementation |
|---|---|
| Status filters | All / Open / Closed (`conversation-list-panel`) |
| Last message preview | From store API `last_message` field |
| Status badges | `conversation-status-badge` |
| Quote linked tag | When `conversation.quote_id` is set |
| New message | Modal form (`new-conversation-form`) |

### 2.2 Thread view

**Route:** `/account/trade/messages/[id]`

| Feature | Implementation |
|---|---|
| Chat bubbles | Customer (right, gold tint) vs admin/system (left) |
| Auto-scroll | Scroll to latest message on load/reply |
| Reply form | `POST /store/b2b/conversations/:id` with `{ body }` |
| Closed state | Read-only banner when `status === "closed"` |

### 2.3 Quote-linked messaging

**Route:** `/account/trade/quotes/[id]` — section **Messages about this quote**

| Action | Behaviour |
|---|---|
| View existing | Links to threads where `quote_id` matches |
| New message | Pre-fills subject + `quote_id`; opens `new-conversation-form` |

### 2.4 Key components

| Path | Purpose |
|---|---|
| `modules/account/components/b2b/conversation-list/` | Row list with preview |
| `modules/account/components/b2b/conversation-list-panel/` | Filters + header actions |
| `modules/account/components/b2b/conversation-thread/` | Thread + reply (client) |
| `modules/account/components/b2b/new-conversation-form/` | Create conversation modal |
| `modules/account/components/b2b/quote-conversation/` | Quote detail messaging block |
| `modules/account/components/b2b/conversation-status-badge/` | Open / Closed badge |
| `lib/data/b2b-account.ts` | `listB2bConversations`, `createB2bConversation`, `replyToB2bConversation` |
| `lib/b2b/account-labels.ts` | `conversationStatusLabel`, `conversationStatusTone` |

---

## 3. Store API (conversations)

| Method | Route | Purpose |
|---|---|---|
| GET | `/store/b2b/conversations` | List for customer/company/quote scope; includes `last_message` |
| POST | `/store/b2b/conversations` | Create with `subject`, optional `quote_id`, `initial_message` |
| GET | `/store/b2b/conversations/:id` | Thread with messages |
| POST | `/store/b2b/conversations/:id` | Customer reply `{ body }` |

**Backend:** `apps/backend/src/api/store/b2b/conversations/`  
**Auth:** Customer session + `requireB2bFeature("conversations_enabled")` + company/quote scope via `customerCanAccessConversation`.

---

## 4. Quotes & approvals (portal summary)

### Quotes

- List/detail via `GET /store/b2b/quotes` and `GET /store/b2b/quotes/:id`
- Components: `quote-list`, `quote-detail`
- Status labels: `lib/b2b/account-labels.ts` → `quoteStatusLabel`

### Order approvals

- List at `/account/trade/approvals`
- `GET /store/b2b/order-approvals`
- Approvers/admins: `POST /store/b2b/order-approvals/:id/approve` and `/reject`
- Password reset: storefront **Forgot password?** and admin **Customers → Send password reset** (email link)

### Account summary

- `GET /store/b2b/account` — company, member role, counts (quotes, conversations, pending approvals)
- Powers trade overview stat cards

---

## 5. Feature flags

From `StoreB2bSettings.features` (admin **B2B → Settings**):

| Flag | Storefront effect |
|---|---|
| `conversations` | Hide `/account/trade/messages` nav + pages → 404 |
| `quotes` | Hide quote routes |
| `order_approval` | Hide approvals route |

---

## 6. Testing checklist

1. Log in as trade customer with linked company.
2. Open `/gb/account/trade/messages` → **New message** → create thread.
3. Reply in thread; verify refresh shows new bubble.
4. Open a quote detail → **Message about this quote** → verify `quote_id` link.
5. Admin replies from `/app/b2b/conversations/[id]` → customer sees admin message on refresh.
6. Disable conversations in B2B Settings → messages route returns 404.

---

## 7. Changelog

| Date | Version | Summary |
|---|---|---|
| 9 Aug 2026 | 1.0 | P1-1 complete: list filters, thread UI, new conversation, quote messaging, `last_message` API |

---

## 8. Document maintenance

**Regenerate Word copy:**

```powershell
& scripts/export-all-docs.ps1
```

Or single file:

```powershell
$master = "docs/master"
& scripts/export-md-to-docx.ps1 -InputPaths @(
  "$master/STOREFRONT-B2B-ACCOUNT.md"
) -OutputDirs @($master)
```
