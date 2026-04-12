# Ordo Backend API Specification

Last updated: 2026-04-12

## 1. Purpose

This document translates the current frontend and the product PRD into a backend-ready API and data design spec.

It is intended for the backend team to:

- design the database schema
- define API contracts
- avoid missing any field currently used or implied by the project
- support future frontend integration without reworking core models

This spec is based on:

- implemented routes and components in `src/app/**`
- shared state in `src/context/OrderContext.tsx`
- product requirements in `prd.md`

## 2. Product Summary

Ordo is a desktop-first food vendor POS and storefront setup flow for independent merchants.

Primary merchant journey:

1. Merchant enters email on landing page.
2. Merchant verifies a 6-digit OTP.
3. Backend checks whether the merchant already exists.
4. Existing merchant goes directly to the main app.
5. New merchant enters onboarding and sets up storefront details.
6. New merchant creates menu items.
7. Merchant starts taking in-person orders.
8. Merchant reviews past orders.
9. Merchant edits store profile, menu, and sees analytics.

## 3. Current Frontend Route Map

| Route | Purpose | Backend dependency |
| --- | --- | --- |
| `/` | Landing page with email capture | auth OTP request |
| `/otp` | 6-digit OTP verification | auth OTP verify, resend |
| `/setup` | Storefront setup | merchant/store create or update |
| `/menu-builder` | Initial menu creation | menu item create, upload image |
| `/dashboard` | POS screen with take orders, past orders, profile tabs | menu fetch, order create, order list, analytics, profile fetch/update |
| `/edit-menu` | Edit existing menu items | menu fetch/create/update/delete |

Also note:

- `CurrentOrderBar` is global in the root layout and depends on current order state and final order creation.
- `PastOrdersScreen` and `ProfileScreen` are rendered inside `/dashboard`.

## 4. Frontend-Derived Functional Areas

### 4.1 Authentication and access

The frontend currently expects:

- email submission
- OTP generation
- OTP verification
- OTP resend
- existing-user check after verification
- route decision after verification
- authenticated merchant session after verification
- logout

### 4.2 Merchant/store setup

The frontend currently expects these editable store fields:

- `storeName`
- `location`
- `contactNumber`

The profile view also implies:

- store online/offline status

### 4.3 Menu management

The frontend currently expects:

- list menu items
- search menu items by name
- create menu item
- edit menu item
- delete menu item

The PRD additionally requires:

- menu item photo upload

### 4.4 Order taking

The frontend currently expects:

- fetch active menu
- add menu item to current order
- increment/decrement quantity
- calculate totals
- create final order
- clear order locally

### 4.5 Order history

The frontend currently expects:

- list past orders
- sort orders by:
  - `newest`
  - `oldest`
  - `highest`
  - `lowest`
- fetch order detail

The PRD additionally implies:

- filter orders by:
  - `all`
  - `today`
  - `pending`
  - `completed`

### 4.6 Profile and analytics

The frontend currently expects:

- fetch merchant/store profile
- update merchant/store profile
- fetch weekly sales analytics

## 5. Canonical Domain Model

The frontend uses temporary local state today. The backend should expose stable canonical models, not mirror the current in-memory TypeScript shapes exactly.

Recommended cross-system standards:

- IDs: string UUID/ULID, not incremental integers
- timestamps: ISO 8601 UTC strings
- money: integer minor units, not strings
- currency: ISO 4217 code, currently `INR`
- phone storage: normalized E.164 plus raw display value if needed

## 6. Entities and Fields

## 6.1 Merchant User

Represents the authenticated operator/owner.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `userId` | string | yes | backend | primary key |
| `email` | string | yes | landing page | lowercase, unique |
| `emailVerified` | boolean | yes | OTP flow | true after OTP verification |
| `emailVerifiedAt` | string \| null | no | backend | ISO timestamp |
| `lastLoginAt` | string \| null | no | backend | ISO timestamp |
| `createdAt` | string | yes | backend | ISO timestamp |
| `updatedAt` | string | yes | backend | ISO timestamp |

## 6.2 OTP Challenge

Represents the login verification challenge.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `challengeId` | string | yes | backend | returned after OTP request |
| `email` | string | yes | landing page | challenge target |
| `purpose` | enum | yes | backend | `login`, `signup`, `verify_email` |
| `codeLength` | number | yes | OTP screen | currently 6 |
| `status` | enum | yes | backend | `pending`, `verified`, `expired`, `locked` |
| `expiresAt` | string | yes | backend | OTP validity |
| `resendAvailableAt` | string \| null | no | backend | resend cooldown |
| `attemptCount` | number | yes | backend | failed verification attempts |
| `maxAttempts` | number | yes | backend | lockout threshold |
| `resendCount` | number | yes | backend | anti-abuse |
| `verifiedAt` | string \| null | no | backend | set on success |
| `createdAt` | string | yes | backend | ISO timestamp |

Important: never return the raw OTP code outside development tooling.

## 6.3 Session

Used after OTP verification.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `sessionId` | string | yes | backend | primary key |
| `userId` | string | yes | backend | owner |
| `storeId` | string \| null | no | backend | current active store |
| `accessToken` | string | yes | backend | if token auth is used |
| `refreshToken` | string \| null | no | backend | if refresh flow is used |
| `expiresAt` | string | yes | backend | session expiry |
| `createdAt` | string | yes | backend | ISO timestamp |

## 6.3.1 Post-Verification Access Decision

After OTP verification, backend must decide whether the email belongs to:

- an existing merchant with completed onboarding
- an existing merchant with incomplete onboarding
- a new user with no store yet

Recommended response fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `userExists` | boolean | yes | true if email already maps to a known user |
| `hasStore` | boolean | yes | true if a store already exists |
| `onboardingCompleted` | boolean | yes | true if onboarding is fully done |
| `nextStep` | enum | yes | `dashboard`, `store_setup`, `menu_setup` |
| `nextRoute` | string | yes | frontend navigation target |

Routing rules:

| Condition | `nextStep` | `nextRoute` | Expected frontend behavior |
| --- | --- | --- | --- |
| existing user + onboarding complete | `dashboard` | `/dashboard` | open take orders / main screens directly |
| existing user + store exists but onboarding incomplete | `menu_setup` or `store_setup` | `/menu-builder` or `/setup` | resume onboarding |
| new user | `store_setup` | `/setup` | start onboarding |

## 6.4 Store

This is the storefront/merchant profile edited in setup and profile screens.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | string | yes | backend | primary key |
| `ownerUserId` | string | yes | backend | FK to merchant user |
| `storeName` | string | yes | setup/profile | editable |
| `locationLabel` | string | yes | setup/profile | current UI only has one text field |
| `contactNumber` | string | yes | setup/profile | display version accepted from frontend |
| `contactNumberE164` | string \| null | no | backend | normalized phone |
| `currency` | string | yes | backend | `INR` today |
| `timezone` | string | yes | backend | default to merchant timezone |
| `status` | enum | yes | profile | `online`, `offline` |
| `onboardingStep` | enum | yes | flow | `email_verified`, `store_setup`, `menu_setup`, `completed` |
| `onboardingCompleted` | boolean | yes | backend | easier frontend gating |
| `onboardingCompletedAt` | string \| null | no | backend | ISO timestamp |
| `createdAt` | string | yes | backend | ISO timestamp |
| `updatedAt` | string | yes | backend | ISO timestamp |

Recommended optional expansion fields for future-proofing:

- `addressLine1`
- `addressLine2`
- `city`
- `state`
- `postalCode`
- `countryCode`
- `brandImageUrl`

The current frontend only exposes a single `location` text field, so `locationLabel` is required even if structured address fields are later added.

## 6.5 Menu Item

Represents one sellable item.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `itemId` | string | yes | backend | primary key |
| `storeId` | string | yes | backend | owner store |
| `name` | string | yes | menu builder/edit menu/dashboard | searchable |
| `priceMinor` | number | yes | menu builder/edit menu/dashboard | integer in paise |
| `currency` | string | yes | backend | `INR` |
| `imageAssetId` | string \| null | no | PRD | photo support |
| `imageUrl` | string \| null | no | PRD | resolved public URL |
| `isActive` | boolean | yes | dashboard/edit menu | hide inactive items from POS if needed |
| `sortOrder` | number | yes | backend | stable grid ordering |
| `createdAt` | string | yes | backend | ISO timestamp |
| `updatedAt` | string | yes | backend | ISO timestamp |

Optional but recommended:

- `description`
- `sku`
- `categoryName`
- `deletedAt`

Reason: the current UI does not need them yet, but APIs will be easier to evolve if soft delete and categorization are supported.

## 6.6 Media Asset

Needed because the PRD explicitly includes menu item photos.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `assetId` | string | yes | backend | primary key |
| `storeId` | string | yes | backend | owner store |
| `kind` | enum | yes | backend | `menu_item_image` |
| `fileName` | string | yes | backend | original or generated |
| `mimeType` | string | yes | backend | image MIME type |
| `fileSizeBytes` | number | yes | backend | upload validation |
| `width` | number \| null | no | backend | image metadata |
| `height` | number \| null | no | backend | image metadata |
| `storageKey` | string | yes | backend | object storage key |
| `publicUrl` | string | yes | backend | CDN or signed delivery URL |
| `createdAt` | string | yes | backend | ISO timestamp |

## 6.7 Order

Represents a completed or pending POS order. Even though the current UI only creates final orders, the PRD requires pending/completed support.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `orderId` | string | yes | backend | primary key |
| `storeId` | string | yes | backend | owner store |
| `orderNumber` | string | yes | past orders | human-readable ID shown in UI; replaces local `ORD-XXXXXX` |
| `status` | enum | yes | PRD + future | `pending`, `completed`, `cancelled` |
| `source` | enum | yes | backend | `pos` for current app |
| `currency` | string | yes | backend | `INR` |
| `subtotalMinor` | number | yes | current order | before tax/fees |
| `taxMinor` | number | yes | PRD dashboard | current UI mentions tax in PRD even though not implemented |
| `discountMinor` | number | yes | backend | default `0` |
| `totalMinor` | number | yes | current order/past orders | payable/final amount |
| `totalItems` | number | yes | current order/past orders | sum of quantities |
| `createdAt` | string | yes | past orders | order creation time |
| `completedAt` | string \| null | no | backend | filled when status becomes completed |
| `updatedAt` | string | yes | backend | ISO timestamp |

Recommended operational fields:

- `notes`
- `paymentStatus`
- `paymentMethod`
- `cancelReason`

If payments are not yet implemented, `paymentStatus` can default to `unpaid` or `paid` based on business flow. The frontend currently behaves like immediate completion without payment detail.

## 6.8 Order Line Item

Orders must store snapshots, not only references to menu items.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `lineItemId` | string | yes | backend | primary key |
| `orderId` | string | yes | backend | FK |
| `menuItemId` | string \| null | no | backend | nullable if item deleted later |
| `nameSnapshot` | string | yes | current order/past orders | item name at purchase time |
| `unitPriceMinor` | number | yes | current order/past orders | item price at purchase time |
| `quantity` | number | yes | current order/past orders | integer > 0 |
| `lineTotalMinor` | number | yes | backend | `unitPriceMinor * quantity` |
| `imageUrlSnapshot` | string \| null | no | PRD | optional for history/detail views |

## 6.9 Weekly Sales Analytics

Profile screen currently renders weekly sales.

| Field | Type | Required | Source | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | string | yes | backend | owner store |
| `rangeKey` | enum | yes | backend | `week` for current UI |
| `rangeStart` | string | yes | backend | ISO date/time |
| `rangeEnd` | string | yes | backend | ISO date/time |
| `currency` | string | yes | backend | `INR` |
| `totalSalesMinor` | number | yes | profile analytics | sum of completed sales |
| `dailySeries` | array | yes | profile analytics | list of daily sales entries |

Each `dailySeries` entry should contain:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `date` | string | yes | ISO date |
| `label` | string | yes | e.g. `Mon` |
| `salesMinor` | number | yes | total daily sales |
| `orderCount` | number | yes | daily completed orders |

## 7. Screen-to-Field Coverage

This section exists to ensure no UI field is missed.

### 7.1 Landing page

| UI element | Backend field |
| --- | --- |
| email input | `email` |

### 7.2 OTP screen

| UI element | Backend field |
| --- | --- |
| OTP input | `otpCode` request field |
| resend button | `challengeId` or current login context |
| verify action | `challengeId`, `otpCode` |
| post-verify redirect | `access.nextRoute` |

### 7.3 Setup screen

| UI element | Backend field |
| --- | --- |
| store name | `storeName` |
| location | `locationLabel` |
| contact number | `contactNumber` |

### 7.4 Menu builder

| UI element | Backend field |
| --- | --- |
| item name | `name` |
| item price | `priceMinor` |
| item photo | `imageAssetId` / `imageUrl` |
| delete item | `itemId` |

### 7.5 Dashboard POS

| UI element | Backend field |
| --- | --- |
| search input | `search` query param |
| item quantity badge | derived from cart/order draft |
| add item | `menuItemId`, `quantity` |
| order total | `totalMinor` |
| total items | `totalItems` |
| create order | order create request |

### 7.6 Past orders

| UI element | Backend field |
| --- | --- |
| order id | `orderNumber` |
| created time/date | `createdAt` |
| item count | `totalItems` |
| total | `totalMinor` |
| sort chips | `sort` query param |
| filter chips from PRD | `status`, `datePreset` query params |
| detail drawer item rows | `items[]` snapshots |

### 7.7 Profile

| UI element | Backend field |
| --- | --- |
| store name | `storeName` |
| location | `locationLabel` |
| contact number | `contactNumber` |
| online badge | `status` |
| weekly total sales | `totalSalesMinor` |
| daily chart bars | `dailySeries[]` |

## 8. API Design Principles

- Version all APIs under `/api/v1`.
- Return normalized resource IDs as strings.
- Return money in minor units and let frontend format `₹`.
- Support pagination on list endpoints even if UI is currently small.
- Return server-generated timestamps everywhere.
- Keep response shapes stable and explicit.
- Use soft delete or inactive states for menu items where possible.

## 9. Authentication APIs

## 9.1 Request OTP

`POST /api/v1/auth/otp/request`

Purpose:

- submit merchant email
- create OTP challenge
- send OTP by email

Request body:

```json
{
  "email": "chef@kitchen.com"
}
```

Response:

```json
{
  "challengeId": "otp_01JXYZ...",
  "email": "chef@kitchen.com",
  "codeLength": 6,
  "expiresAt": "2026-04-12T08:35:00.000Z",
  "resendAvailableAt": "2026-04-12T08:31:00.000Z",
  "status": "pending"
}
```

Validation:

- email required
- valid email format
- lowercase and trimmed before storage
- rate limit by email and IP/device

## 9.2 Verify OTP

`POST /api/v1/auth/otp/verify`

Request body:

```json
{
  "challengeId": "otp_01JXYZ...",
  "otpCode": "123456"
}
```

Response:

```json
{
  "session": {
    "sessionId": "sess_01JXYZ...",
    "expiresAt": "2026-04-19T08:30:00.000Z"
  },
  "user": {
    "userId": "usr_01JXYZ...",
    "email": "chef@kitchen.com",
    "emailVerified": true
  },
  "store": null,
  "access": {
    "userExists": false,
    "hasStore": false,
    "onboardingCompleted": false,
    "nextStep": "store_setup",
    "nextRoute": "/setup"
  }
}
```

Validation:

- `otpCode` required
- exactly 6 digits
- challenge must be unexpired and pending
- enforce attempt lockout
- after successful verification, backend must check whether the user already exists and return the routing decision

Existing merchant example:

```json
{
  "session": {
    "sessionId": "sess_01JXYZ...",
    "expiresAt": "2026-04-19T08:30:00.000Z"
  },
  "user": {
    "userId": "usr_01JXYZ...",
    "email": "chef@kitchen.com",
    "emailVerified": true
  },
  "store": {
    "storeId": "store_01JABC...",
    "storeName": "The Daily Bread",
    "locationLabel": "Bandra West, Mumbai",
    "contactNumber": "+919876543210",
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "status": "online",
    "onboardingStep": "completed",
    "onboardingCompleted": true
  },
  "access": {
    "userExists": true,
    "hasStore": true,
    "onboardingCompleted": true,
    "nextStep": "dashboard",
    "nextRoute": "/dashboard"
  }
}
```

## 9.3 Resend OTP

`POST /api/v1/auth/otp/resend`

Request body:

```json
{
  "challengeId": "otp_01JXYZ..."
}
```

Response:

```json
{
  "challengeId": "otp_01JXYZ...",
  "expiresAt": "2026-04-12T08:38:00.000Z",
  "resendAvailableAt": "2026-04-12T08:34:00.000Z",
  "status": "pending"
}
```

## 9.4 Fetch current auth context

`GET /api/v1/me`

Response:

```json
{
  "user": {
    "userId": "usr_01JXYZ...",
    "email": "chef@kitchen.com",
    "emailVerified": true
  },
  "store": {
    "storeId": "store_01JXYZ...",
    "storeName": "The Daily Bread",
    "locationLabel": "Bandra West, Mumbai",
    "contactNumber": "+919876543210",
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "status": "online",
    "onboardingStep": "menu_setup",
    "onboardingCompleted": false
  },
  "access": {
    "userExists": true,
    "hasStore": true,
    "onboardingCompleted": false,
    "nextStep": "menu_setup",
    "nextRoute": "/menu-builder"
  }
}
```

## 9.5 Logout

`POST /api/v1/auth/logout`

Request body:

```json
{}
```

Response:

```json
{
  "success": true
}
```

## 10. Store APIs

## 10.1 Create store after OTP verification

`POST /api/v1/stores`

Use when a verified user has no store yet. This is the onboarding path for a verified email that does not belong to an already onboarded merchant.

Request body:

```json
{
  "storeName": "The Daily Bread",
  "locationLabel": "Bandra West, Mumbai",
  "contactNumber": "+919876543210",
  "currency": "INR",
  "timezone": "Asia/Kolkata"
}
```

Response:

```json
{
  "storeId": "store_01JXYZ...",
  "ownerUserId": "usr_01JXYZ...",
  "storeName": "The Daily Bread",
  "locationLabel": "Bandra West, Mumbai",
  "contactNumber": "+919876543210",
  "contactNumberE164": "+919876543210",
  "currency": "INR",
  "timezone": "Asia/Kolkata",
  "status": "online",
  "onboardingStep": "menu_setup",
  "onboardingCompleted": false,
  "createdAt": "2026-04-12T08:40:00.000Z",
  "updatedAt": "2026-04-12T08:40:00.000Z"
}
```

## 10.2 Get current store

`GET /api/v1/stores/current`

Returns the active store profile for the logged-in merchant.

## 10.3 Update store profile

`PATCH /api/v1/stores/{storeId}`

Request body:

```json
{
  "storeName": "The Gourmet Kitchen",
  "locationLabel": "123 Main Street, New York",
  "contactNumber": "+15551234567",
  "status": "online"
}
```

Response: full updated store object.

Validation:

- `storeName`: required for create, non-empty
- `locationLabel`: required for create
- `contactNumber`: required for create, store normalized number when possible
- `status`: allow `online` or `offline`

## 11. Menu APIs

## 11.1 List menu items

`GET /api/v1/stores/{storeId}/menu-items`

Query params:

- `search`: string
- `isActive`: boolean
- `page`: number
- `pageSize`: number
- `sort`: optional, default `sortOrder`

Response:

```json
{
  "items": [
    {
      "itemId": "item_01JXYZ...",
      "storeId": "store_01JXYZ...",
      "name": "Avocado Toast",
      "priceMinor": 85000,
      "currency": "INR",
      "imageAssetId": null,
      "imageUrl": null,
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2026-04-12T08:50:00.000Z",
      "updatedAt": "2026-04-12T08:50:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 6
  }
}
```

Note: `priceMinor` should represent paise. If the product price is `₹850`, the value should be `85000`. If the business wants whole-rupee pricing only, the backend can still store paise to stay consistent.

## 11.2 Create menu item

`POST /api/v1/stores/{storeId}/menu-items`

Request body:

```json
{
  "name": "Croissant",
  "priceMinor": 35000,
  "currency": "INR",
  "imageAssetId": "asset_01JXYZ..."
}
```

Response: full created menu item object.

Validation:

- `name` required
- `priceMinor` required and `> 0`
- `imageAssetId` optional for current UI, but should be supported now because PRD requires photos

## 11.3 Get single menu item

`GET /api/v1/stores/{storeId}/menu-items/{itemId}`

## 11.4 Update menu item

`PATCH /api/v1/stores/{storeId}/menu-items/{itemId}`

Request body:

```json
{
  "name": "Blueberry Muffin",
  "priceMinor": 30000,
  "imageAssetId": "asset_01JXYZ...",
  "isActive": true
}
```

Response: full updated menu item object.

## 11.5 Delete menu item

`DELETE /api/v1/stores/{storeId}/menu-items/{itemId}`

Recommended behavior:

- soft delete or set `isActive=false`
- do not break historical orders referencing this item

Response:

```json
{
  "success": true
}
```

## 12. Media Upload APIs

## 12.1 Create menu image upload session

`POST /api/v1/stores/{storeId}/assets/upload-url`

Request body:

```json
{
  "kind": "menu_item_image",
  "fileName": "croissant.jpg",
  "mimeType": "image/jpeg",
  "fileSizeBytes": 248122
}
```

Response:

```json
{
  "assetId": "asset_01JXYZ...",
  "uploadUrl": "https://storage.example.com/...",
  "publicUrl": "https://cdn.example.com/...",
  "expiresAt": "2026-04-12T09:00:00.000Z"
}
```

Alternative acceptable design:

- direct multipart upload endpoint handled by backend

## 13. Order APIs

## 13.1 Create order

`POST /api/v1/stores/{storeId}/orders`

This is the main checkout/complete-order endpoint for the current app.

Request body:

```json
{
  "status": "completed",
  "source": "pos",
  "currency": "INR",
  "items": [
    {
      "menuItemId": "item_01JXYZ...",
      "nameSnapshot": "Avocado Toast",
      "unitPriceMinor": 85000,
      "quantity": 2
    },
    {
      "menuItemId": "item_01JABC...",
      "nameSnapshot": "Iced Latte",
      "unitPriceMinor": 40000,
      "quantity": 1
    }
  ],
  "taxMinor": 0,
  "discountMinor": 0,
  "notes": null
}
```

Response:

```json
{
  "orderId": "ord_01JXYZ...",
  "orderNumber": "ORD-2FK9Q1",
  "storeId": "store_01JXYZ...",
  "status": "completed",
  "source": "pos",
  "currency": "INR",
  "subtotalMinor": 210000,
  "taxMinor": 0,
  "discountMinor": 0,
  "totalMinor": 210000,
  "totalItems": 3,
  "items": [
    {
      "lineItemId": "line_01...",
      "menuItemId": "item_01JXYZ...",
      "nameSnapshot": "Avocado Toast",
      "unitPriceMinor": 85000,
      "quantity": 2,
      "lineTotalMinor": 170000,
      "imageUrlSnapshot": null
    },
    {
      "lineItemId": "line_02...",
      "menuItemId": "item_01JABC...",
      "nameSnapshot": "Iced Latte",
      "unitPriceMinor": 40000,
      "quantity": 1,
      "lineTotalMinor": 40000,
      "imageUrlSnapshot": null
    }
  ],
  "createdAt": "2026-04-12T09:05:00.000Z",
  "completedAt": "2026-04-12T09:05:00.000Z",
  "updatedAt": "2026-04-12T09:05:00.000Z"
}
```

Validation:

- at least one item
- every item must have `quantity > 0`
- backend should recompute totals, not trust frontend totals
- backend should snapshot item name and price at order time

## 13.2 List orders

`GET /api/v1/stores/{storeId}/orders`

Query params:

- `page`
- `pageSize`
- `sort`: `newest`, `oldest`, `highest`, `lowest`
- `status`: `pending`, `completed`, `cancelled`
- `datePreset`: `today`
- `from`
- `to`

Response:

```json
{
  "items": [
    {
      "orderId": "ord_01JXYZ...",
      "orderNumber": "ORD-2FK9Q1",
      "status": "completed",
      "currency": "INR",
      "totalItems": 3,
      "totalMinor": 210000,
      "createdAt": "2026-04-12T09:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

Backend note:

- this endpoint should support both the current implemented sort chips and the PRD filter chips

## 13.3 Get order detail

`GET /api/v1/stores/{storeId}/orders/{orderId}`

Response:

```json
{
  "orderId": "ord_01JXYZ...",
  "orderNumber": "ORD-2FK9Q1",
  "storeId": "store_01JXYZ...",
  "status": "completed",
  "source": "pos",
  "currency": "INR",
  "subtotalMinor": 210000,
  "taxMinor": 0,
  "discountMinor": 0,
  "totalMinor": 210000,
  "totalItems": 3,
  "items": [
    {
      "lineItemId": "line_01...",
      "menuItemId": "item_01JXYZ...",
      "nameSnapshot": "Avocado Toast",
      "unitPriceMinor": 85000,
      "quantity": 2,
      "lineTotalMinor": 170000,
      "imageUrlSnapshot": null
    }
  ],
  "createdAt": "2026-04-12T09:05:00.000Z",
  "completedAt": "2026-04-12T09:05:00.000Z",
  "updatedAt": "2026-04-12T09:05:00.000Z"
}
```

## 13.4 Update order status

`PATCH /api/v1/stores/{storeId}/orders/{orderId}`

Needed for PRD support of pending/completed states.

Request body:

```json
{
  "status": "completed"
}
```

Response: full updated order object.

## 14. Analytics APIs

## 14.1 Weekly sales analytics

`GET /api/v1/stores/{storeId}/analytics/sales?range=week`

Response:

```json
{
  "storeId": "store_01JXYZ...",
  "rangeKey": "week",
  "rangeStart": "2026-04-06T00:00:00.000Z",
  "rangeEnd": "2026-04-12T23:59:59.999Z",
  "currency": "INR",
  "totalSalesMinor": 19600000,
  "dailySeries": [
    { "date": "2026-04-06", "label": "Mon", "salesMinor": 1500000, "orderCount": 12 },
    { "date": "2026-04-07", "label": "Tue", "salesMinor": 2200000, "orderCount": 17 },
    { "date": "2026-04-08", "label": "Wed", "salesMinor": 1800000, "orderCount": 14 },
    { "date": "2026-04-09", "label": "Thu", "salesMinor": 2600000, "orderCount": 21 },
    { "date": "2026-04-10", "label": "Fri", "salesMinor": 3500000, "orderCount": 28 },
    { "date": "2026-04-11", "label": "Sat", "salesMinor": 4200000, "orderCount": 33 },
    { "date": "2026-04-12", "label": "Sun", "salesMinor": 3800000, "orderCount": 30 }
  ]
}
```

## 15. Recommended Response Conventions

### 15.1 Error format

Use a consistent error body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "contactNumber is invalid",
    "fieldErrors": {
      "contactNumber": "Expected a valid phone number"
    }
  }
}
```

Recommended error codes:

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `RATE_LIMITED`
- `OTP_INVALID`
- `OTP_EXPIRED`
- `OTP_LOCKED`
- `CONFLICT`
- `INTERNAL_ERROR`

### 15.2 Pagination format

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

## 16. Validation Rules

### 16.1 Email

- required for OTP request
- trim spaces
- lowercase
- valid email syntax
- unique per merchant account

### 16.2 OTP

- exactly 6 digits
- expires after short TTL
- attempt-limited
- resend-limited

### 16.3 Store fields

- `storeName`: 1 to 120 chars
- `locationLabel`: 1 to 160 chars
- `contactNumber`: accept current frontend input, normalize server-side
- `currency`: default `INR`
- `timezone`: required, default from account or store setting

### 16.4 Menu item fields

- `name`: 1 to 120 chars
- `priceMinor`: integer `> 0`
- `imageAssetId`: nullable
- `isActive`: boolean

### 16.5 Order fields

- at least one line item
- `quantity`: integer `> 0`
- recompute totals server-side
- reject negative tax or discount unless business rules explicitly allow them

## 17. Suggested Database Tables

Minimum backend tables:

- `users`
- `otp_challenges`
- `sessions`
- `stores`
- `assets`
- `menu_items`
- `orders`
- `order_line_items`
- `sales_aggregates_daily` or equivalent derived analytics store

## 18. Integration Gaps in Current Frontend

These are important because the frontend is not yet wired to backend state.

### 18.0 Existing user routing after OTP is not implemented

Impact:

- after OTP success, the app currently always routes to `/setup`
- this is incorrect for returning merchants

Backend implication:

- `POST /api/v1/auth/otp/verify` must return an explicit `access` object
- frontend should route using `access.nextRoute`
- existing merchants with completed onboarding should land directly on `/dashboard`

### 18.1 Email is not persisted between `/` and `/otp`

Impact:

- OTP verify currently has no access to the previously entered email.

Backend implication:

- use `challengeId` as the main OTP verification handle
- frontend should carry `challengeId` forward after OTP request

### 18.2 Setup data is not persisted into profile

Impact:

- store setup fields and profile fields are currently disconnected mock states.

Backend implication:

- `GET /api/v1/stores/current` must become the source of truth for both setup completion and profile display

### 18.3 Menu builder state is separate from dashboard menu state

Impact:

- `/menu-builder` uses local `menuItems`
- `/dashboard` uses `OrderContext.defaultMenuItems`

Backend implication:

- after initial menu creation, dashboard must fetch menu items from backend, not local defaults
- menu builder should POST created items to backend immediately or in batch before navigation

### 18.4 Orders are currently memory-only

Impact:

- refresh loses current order and past orders

Backend implication:

- final order creation must persist immediately
- order list/detail must always come from backend

### 18.5 Analytics are mock data

Impact:

- profile analytics are placeholders only

Backend implication:

- analytics endpoint should aggregate completed orders by day

## 19. MVP Endpoint Checklist

If the backend team wants the minimum set needed to wire the current app, implement these first:

1. `POST /api/v1/auth/otp/request`
2. `POST /api/v1/auth/otp/verify`
3. `POST /api/v1/auth/otp/resend`
4. `GET /api/v1/me`
5. `POST /api/v1/stores`
6. `GET /api/v1/stores/current`
7. `PATCH /api/v1/stores/{storeId}`
8. `GET /api/v1/stores/{storeId}/menu-items`
9. `POST /api/v1/stores/{storeId}/menu-items`
10. `PATCH /api/v1/stores/{storeId}/menu-items/{itemId}`
11. `DELETE /api/v1/stores/{storeId}/menu-items/{itemId}`
12. `POST /api/v1/stores/{storeId}/assets/upload-url`
13. `POST /api/v1/stores/{storeId}/orders`
14. `GET /api/v1/stores/{storeId}/orders`
15. `GET /api/v1/stores/{storeId}/orders/{orderId}`
16. `PATCH /api/v1/stores/{storeId}/orders/{orderId}`
17. `GET /api/v1/stores/{storeId}/analytics/sales?range=week`

## 20. Final Recommendation

The backend should treat `Store`, `MenuItem`, and `Order` as the three core business entities, with OTP auth as the access layer.

Two implementation decisions matter most:

1. Use money in minor units and compute totals on the server.
2. Store order line item snapshots so historical orders never change when menu items are edited or deleted.
3. After OTP verification, always return whether the email belongs to an existing merchant and whether onboarding is complete, so the frontend can send existing users straight to `/dashboard` and new users into onboarding.

If the backend team follows the models and endpoints above, every currently implemented screen plus the PRD-required menu-photo and order-status features can be wired without redesigning the API surface later.
