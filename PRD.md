Ini dia **Daftar Belanja (Tech Stack)** lengkap untuk *The Async-Pragmatic Stack* versi Hackathon. Tinggal copy-paste buat install.

Aku bagi per kategori sesuai struktur Monorepo (Turborepo) kamu.

### 1. Monorepo & Core Tools

*(Di root folder)*

* **Monorepo Manager:** `turborepo` (Manage task build/dev)
* **Package Manager:** `bun` (Biar install & run super ngebut)
* **Language:** `typescript` (Wajib, shared types)

---

### 2. Frontend: Mobile App (`apps/mobile`)

*Target: iOS & Android (via Expo)*

**Core Framework:**

* `expo` (SDK 52 - Latest)
* `react-native`
* `expo-router` (File-based routing, mirip Next.js)

**Styling & UI (Sat-Set):**

* `nativewind` (v4) + `tailwindcss` (Styling CSS class di RN)
* `react-native-reanimated` (Animasi smooth)
* `expo-font` + `@expo-google-fonts/*` (Typography)

**State & Data (The Magic):**

* `zustand` (Global store simple)
* `@tanstack/react-query` (Auto-refetch, caching, background sync)
* `react-native-mmkv` (Local storage super cepat, pengganti AsyncStorage)

**Critical Native Features (Sesuai PRD):**

* `expo-share-intent` (Terima link dari TikTok/IG)
* `expo-video` (Player video baru yang ringan)
* `expo-notifications` (Push notif saat AI kelar)
* `react-native-purchases` (RevenueCat - Monetization)

---

### 3. Backend: API Logic (`apps/api`)

*Target: Cloudflare Workers (Edge)*

**Framework:**

* `hono` (Framework backend, pengganti Express/Next API)

**Database & ORM:**

* `drizzle-orm` (Query builder)
* `drizzle-kit` (Dev tool buat migrasi DB)
* `@neondatabase/serverless` (Driver HTTP buat connect ke Neon dari Edge)

**Utilities:**

* `zod` (Validasi input data dari frontend/AI)
* `dotenv` (Manage API Keys)

---

### 4. External Services (The Brains)

**Database & Auth:**

* **Neon Console:** Postgres Database + **Neon Auth** (Sesuai request kamu)

**AI & Content:**

* **OpenAI API:** Model `gpt-4o` atau `gpt-5.2` (sesuai akses kamu) -> untuk parsing JSON.
* **ScrapeCreators API:** Untuk ambil transcript/metadata dari link video.

---

### 5. Struktur `package.json` (Cheat Sheet)

Biar gak bingung install satu-satu, ini *command* intinya:

**Di Folder `apps/mobile`:**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npm install nativewind tailwindcss zustand @tanstack/react-query react-native-mmkv expo-share-intent expo-video expo-notifications react-native-purchases

```

**Di Folder `apps/api`:**

```bash
npm install hono drizzle-orm @neondatabase/serverless zod openai
npm install -D drizzle-kit wrangler @cloudflare/workers-types

```

Siap gas coding? Langsung init `npx create-turbo@latest` aja!