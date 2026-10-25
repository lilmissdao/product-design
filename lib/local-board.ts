import { parseBoard, type Board } from "./model";

const STORAGE_KEY = "jj-board-v1";

export function readStoredBoard(): Board | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return parseBoard(JSON.parse(raw) as unknown);
}

export function writeStoredBoard(board: Board): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}
