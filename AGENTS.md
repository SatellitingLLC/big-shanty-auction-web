# Project Context

Next.js App Router application featuring an integrated **GrapesJS** web builder and page editor, backed by a **Neon serverless database** for saving and managing editor configurations and layouts.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Editor Core:** GrapesJS (Client-driven canvas editor)
- **Database/Driver:** Neon PostgreSQL (using `@neondatabase/serverless` or Neon serverless driver)
- **Package Manager:** `pnpm` (Strictly do not use npm/yarn)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS

## Development Commands
- **Run Dev Server:** `pnpm dev`
- **Type Check:** `pnpm tsc --noEmit` or `pnpm build`
- **Lint/Format:** `pnpm lint`

## Architecture & GrapesJS Conventions
- **GrapesJS Boundary:** The GrapesJS editor core depends heavily on browser DOM APIs. **Always** containerize the editor wrapper inside a Client Component (`'use client'`) using a dynamic import with `ssr: false` to prevent server-side rendering errors.
- **State & Syncing:** Handle GrapesJS initialization, plugin mapping, and local component states cleanly. When saving configuration payload schemas (JSON/HTML), use robust serialization layers before dispatching.
- **Server Actions for Persisting:** Route layout saves, page components, and template configurations from the editor directly to Neon through Next.js Server Actions or API routes under `app/api/`.

## Database Rules (Neon & PostgreSQL)
- **Serverless Connections:** Utilize the Neon serverless pooling client appropriately (`@neondatabase/serverless`) to prevent connection exhaustion in serverless edge environments.
- **Transactions & Schemas:** Ensure editor layout blocks and JSON configurations are validated against strong types or database schemas before insertion.

## Context7 Documentation Rule
- **Always Use Context7 for Documentation:** When writing code or refactoring APIs for Next.js, Neon serverless, GrapesJS, or any external package, **always prioritize using Context7 to fetch up-to-date, version-specific documentation**. 
- If the Context7 MCP tool/server is configured, execute queries through it first. Otherwise, append `"use context7"` or explicit context instructions to pull working code snippets straight from the official source, eliminating outdated patterns or hallucinations.

## Hard Rules for AI Generation
- **Strictly use pnpm:** Do not run or generate instructions using `npm install` or `yarn add`. Always supply `pnpm add` or `pnpm run`.
- **Dynamic Editor Imports:** Never attempt to import GrapesJS or its active canvas plugins directly into a React Server Component (RSC) without a `dynamic(() => ..., { ssr: false })` boundary.
- **Never expose Neon credentials:** DB Connection strings must be fetched from `process.env.DATABASE_URL` and kept server-side.
- **No `any` Types:** Explicitly type GrapesJS instances, custom plugins, block managers, and Neon query response payloads.
