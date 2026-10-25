import { BlobAccessError, BlobError, BlobNotFoundError, get, put } from "@vercel/blob";
import { parseBoard, withFocus, type Board } from "./model";
import { seedBoard } from "./seed";

const BLOB_PATH = "board/items.json";

let queue: Promise<void> = Promise.resolve();
let blobAccess: "public" | "private" | null = null;

export function usesBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function loadBoard(): Promise<Board> {
  return enqueue(readRaw);
}

export function changeBoard(change: (board: Board) => Board): Promise<Board> {
  return enqueue(async () => {
    const current = await readRaw();
    const next = withFocus(change(current));
    await writeRaw(next);
    return next;
  });
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function blobEnabled(): boolean {
  return usesBlob();
}

function blobAuth(): { token?: string } {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token ? { token } : {};
}

async function readRaw(): Promise<Board> {
  if (!blobEnabled()) return seedBoard();
  return readBlob();
}

async function writeRaw(board: Board): Promise<void> {
  if (!blobEnabled()) throw new Error("Could not save.");
  await writeBlob(board);
}

async function readBlob(): Promise<Board> {
  const text = await readBlobText();
  if (text == null) return seedBoard();
  try {
    return parseBoard(JSON.parse(text) as unknown);
  } catch (error) {
    if (error instanceof Error && error.message === "The saved board could not be read.") throw error;
    throw new Error("The saved board could not be read.");
  }
}

async function readBlobText(): Promise<string | null> {
  for (const access of accessAttempts()) {
    try {
      const result = await get(BLOB_PATH, {
        access,
        useCache: false,
        ...blobAuth(),
      });
      blobAccess = access;
      if (!result) return null;
      if (result.statusCode !== 200) throw new Error("Could not read the board.");
      return await new Response(result.stream).text();
    } catch (error) {
      if (error instanceof Error && error.message === "Could not read the board.") throw error;
      if (error instanceof BlobNotFoundError) {
        blobAccess = access;
        return null;
      }
      if (error instanceof BlobAccessError && !forcedAccess()) continue;
      throw safeBlobError(error);
    }
  }
  throw new Error(
    "Blob access was refused. Set BLOB_ACCESS to public or private to match the store.",
  );
}

async function writeBlob(board: Board): Promise<void> {
  const access = blobAccess ?? (await accessForWrite());
  try {
    await put(BLOB_PATH, JSON.stringify(board, null, 2), {
      access,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      // The SDK rejects a max-age under 60 seconds. Reads pass useCache: false.
      cacheControlMaxAge: 60,
      ...blobAuth(),
    });
    blobAccess = access;
  } catch (error) {
    throw safeBlobError(error);
  }
}

async function accessForWrite(): Promise<"public" | "private"> {
  await readBlobText();
  return blobAccess ?? "private";
}

function accessAttempts(): Array<"public" | "private"> {
  const forced = forcedAccess();
  if (forced) return [forced];
  if (blobAccess) return [blobAccess];
  return ["private", "public"];
}

function forcedAccess(): "public" | "private" | null {
  const value = process.env.BLOB_ACCESS;
  if (!value) return null;
  if (value === "public" || value === "private") return value;
  throw new Error("BLOB_ACCESS must be public or private.");
}

function safeBlobError(error: unknown): Error {
  if (error instanceof BlobAccessError) {
    return new Error(
      "Blob access was refused. Set BLOB_ACCESS to public or private to match the store.",
    );
  }
  if (error instanceof BlobError) return new Error("Could not reach Blob storage.");
  if (error instanceof Error && error.message === "BLOB_ACCESS must be public or private.") {
    return error;
  }
  return new Error("Could not reach Blob storage.");
}
