# Jeune Jolie product board

A small board for Jeune Jolie product notes. Dao can add ideas, mark what is next, and keep the high-priority work in a focus list she can reorder.

## Local

```bash
npm install
npm run dev
```

Open http://localhost:3000.

With no Blob token, the board is stored in `data/board.json` (not committed). The first visit shows the seed notes. Add, edit, delete, and focus order survive a reload.

If that file cannot be written, the app keeps the board in memory for the current process.

To try the passcode gate locally, set `BOARD_PASSCODE` in `.env.local` and restart.

## Deploy on Vercel

Import this repo and deploy with the defaults. No extra build settings.

### Blob store

Notes sync across devices only after a Blob store is connected.

1. In the Vercel project, open **Storage** and create a Blob store. Use a **private** store so `board/items.json` is not available at a public URL. The passcode does not protect a public blob URL.
2. Connect the store to this project. Vercel sets `BLOB_READ_WRITE_TOKEN` for a token-based store, or `BLOB_STORE_ID` for a private store that uses Vercel’s own login. Either one turns Blob on.
3. Redeploy.

The app keeps a single JSON document at `board/items.json`. Reads skip the CDN cache so a save shows up on the next load.

If the store type and the app disagree, set `BLOB_ACCESS` to `private` or `public` to match the store. Leave it unset to try private first, then public.

Until one of those Blob variables is set, a deployed copy still opens, but notes stay in that instance’s memory and do not sync.

### Passcode

Set `BOARD_PASSCODE` on Production (and Preview, if you want the gate there). The board asks for it once and stores an httpOnly cookie for 30 days. Leave it unset for no gate.

Do not commit the passcode or the Blob token.

## Environment

| Name | Required | Purpose |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | For shared notes | Set when a Blob store is connected with a read-write token |
| `BLOB_STORE_ID` | For shared notes | Set when a private Blob store is connected with Vercel login |
| `BLOB_ACCESS` | No | `private` or `public`, if you need to force the store type |
| `BOARD_PASSCODE` | No | Simple passcode gate |
