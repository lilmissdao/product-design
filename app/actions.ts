"use server";

import { grantAccess, isAuthed, passcodeMatches, passcodeRequired } from "@/lib/auth";
import {
  assertId,
  createItem,
  moveFocus,
  parseBoard,
  parseItemInput,
  removeItem,
  updateItem,
  type BoardResult,
  type ItemInput,
} from "@/lib/model";
import { changeBoard } from "@/lib/store";

const SAFE_ERRORS = new Set([
  "Add a title.",
  "Title is too long.",
  "Note is too long.",
  "Pick an area.",
  "Pick a status.",
  "Pick a priority.",
  "Due date is not valid.",
  "That item is gone.",
  "Enter the passcode first.",
  "Could not save.",
  "Could not read the board.",
  "The saved board could not be read.",
  "Blob access was refused. Set BLOB_ACCESS to public or private to match the store.",
  "Could not reach Blob storage.",
  "BLOB_ACCESS must be public or private.",
]);

export async function unlock(
  passcode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!passcodeRequired()) return { ok: true };
  if (typeof passcode !== "string" || !passcodeMatches(passcode)) {
    return { ok: false, error: "Wrong passcode." };
  }
  await grantAccess();
  return { ok: true };
}

export async function addItem(input: ItemInput): Promise<BoardResult> {
  const denied = await requireAccess();
  if (denied) return { ok: false, error: denied };
  try {
    const board = await changeBoard((current) => createItem(current, parseItemInput(input)));
    return { ok: true, board };
  } catch (error) {
    return failure(error);
  }
}

export async function editItem(id: string, input: ItemInput): Promise<BoardResult> {
  const denied = await requireAccess();
  if (denied) return { ok: false, error: denied };
  try {
    const itemId = assertId(id);
    const board = await changeBoard((current) => updateItem(current, itemId, parseItemInput(input)));
    return { ok: true, board };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteItem(id: string): Promise<BoardResult> {
  const denied = await requireAccess();
  if (denied) return { ok: false, error: denied };
  try {
    const itemId = assertId(id);
    const board = await changeBoard((current) => removeItem(current, itemId));
    return { ok: true, board };
  } catch (error) {
    return failure(error);
  }
}

export async function replaceBoard(value: unknown): Promise<BoardResult> {
  const denied = await requireAccess();
  if (denied) return { ok: false, error: denied };
  try {
    const board = await changeBoard(() => parseBoard(value));
    return { ok: true, board };
  } catch (error) {
    return failure(error);
  }
}

export async function reorderFocus(id: string, direction: -1 | 1): Promise<BoardResult> {
  const denied = await requireAccess();
  if (denied) return { ok: false, error: denied };
  if (direction !== -1 && direction !== 1) return { ok: false, error: "Could not save." };
  try {
    const itemId = assertId(id);
    const board = await changeBoard((current) => moveFocus(current, itemId, direction));
    return { ok: true, board };
  } catch (error) {
    return failure(error);
  }
}

async function requireAccess(): Promise<string | null> {
  if (await isAuthed()) return null;
  return "Enter the passcode first.";
}

function failure(error: unknown): BoardResult {
  const message = error instanceof Error ? error.message : "";
  return { ok: false, error: SAFE_ERRORS.has(message) ? message : "Could not save." };
}
