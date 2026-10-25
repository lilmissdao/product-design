import { connection } from "next/server";
import { isAuthed } from "@/lib/auth";
import type { Board } from "@/lib/model";
import { seedBoard } from "@/lib/seed";
import { loadBoard, usesBlob } from "@/lib/store";
import { BoardView } from "./board-view";
import { Gate } from "./gate";
import { LocalBoardView } from "./local-board-view";

const READ_ERRORS = new Set([
  "Could not read the board.",
  "The saved board could not be read.",
  "Blob access was refused. Set BLOB_ACCESS to public or private to match the store.",
  "Could not reach Blob storage.",
  "BLOB_ACCESS must be public or private.",
]);

export async function BoardSection() {
  await connection();
  if (!(await isAuthed())) return <Gate />;

  if (!usesBlob()) {
    return <LocalBoardView initial={seedBoard()} />;
  }

  let board: Board | null = null;
  let message = "Could not read the board.";
  try {
    board = await loadBoard();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    if (READ_ERRORS.has(detail)) message = detail;
  }

  if (!board) {
    return (
      <p role="alert" className="text-sm text-danger">
        {message}
      </p>
    );
  }

  return <BoardView mode="blob" initial={board} />;
}
