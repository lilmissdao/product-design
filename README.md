# Jeune Jolie product board

A small board for Jeune Jolie product notes. Dao can add ideas, mark what is next, and keep the high-priority work in a focus list she can reorder.

## Local

```bash
npm install
npm run dev
```

Open http://localhost:3000.

With no `BLOB_READ_WRITE_TOKEN`, notes stay in this browser (`localStorage`). The first visit saves the seed notes. Add, edit, delete, and focus order survive a reload on that device. Export downloads a JSON backup. Import replaces the board from a file.

To try the passcode gate locally, set `BOARD_PASSCODE` in `.env.local` and restart.

## Deploy on Vercel

Import this repo and deploy with the defaults. No extra build settings.

No environment variables are required. On Vercel the app does not write to the filesystem. Without `BLOB_READ_WRITE_TOKEN`, each browser keeps its own copy and can move notes with Export and Import.

### Blob store, later

When a Blob store is available, connect it so Vercel sets `BLOB_READ_WRITE_TOKEN`, then redeploy. Prefer a **private** store. The app then keeps one JSON document at `board/items.json` and shares it across devices. The passcode does not protect a public blob URL.

If the store type and the app disagree, set `BLOB_ACCESS` to `private` or `public`. Leave it unset to try private first, then public.

### Passcode

Set `BOARD_PASSCODE` on Production (and Preview, if you want the gate there). The board asks for it once and stores an httpOnly cookie for 30 days. Leave it unset for no gate.

Do not commit the passcode or the Blob token.

## Environment

| Name | Required | Purpose |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | No | Turns on shared Blob storage. Without it, the browser stores the board |
| `BLOB_ACCESS` | No | `private` or `public`, if you need to force the store type |
| `BOARD_PASSCODE` | No | Simple passcode gate |
