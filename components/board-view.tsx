"use client";

import { useRef, useState, useTransition } from "react";
import { addItem, deleteItem, editItem, reorderFocus, replaceBoard } from "@/app/actions";
import { readStoredBoard, writeStoredBoard } from "@/lib/local-board";
import {
  AREAS,
  GROUP_ORDER,
  createItem,
  moveFocus,
  parseBoard,
  parseItemInput,
  removeItem,
  updateItem,
  withFocus,
  type Area,
  type Board,
  type BoardResult,
  type ItemInput,
} from "@/lib/model";
import { AddForm } from "./add-form";
import { ItemCard } from "./item-card";
import { fieldClass, secondaryClass } from "./styles";

function statusHeadingId(status: string): string {
  return `status-${status.replaceAll(" ", "-").toLowerCase()}`;
}

function loadLocalBoard(seed: Board): { board: Board; error: string | null } {
  try {
    const stored = readStoredBoard();
    if (stored) return { board: stored, error: null };
    writeStoredBoard(seed);
    return { board: seed, error: null };
  } catch {
    return { board: seed, error: "Could not read saved notes." };
  }
}

export function BoardView({ mode, initial }: { mode: "local" | "blob"; initial: Board }) {
  const [stored] = useState(() =>
    mode === "local" ? loadLocalBoard(initial) : { board: initial, error: null as string | null },
  );
  const [board, setBoard] = useState(stored.board);
  const [area, setArea] = useState<Area | "All">("All");
  const [error, setError] = useState<string | null>(stored.error);
  const [pending, startTransition] = useTransition();
  const importRef = useRef<HTMLInputElement>(null);

  function remember(result: BoardResult) {
    if (result.ok) setBoard(result.board);
    else setError(result.error);
  }

  function saveLocal(change: (current: Board) => Board): BoardResult {
    const next = withFocus(change(board));
    writeStoredBoard(next);
    return { ok: true, board: next };
  }

  function run(
    change: (current: Board) => Board,
    server: () => Promise<BoardResult>,
  ): Promise<BoardResult> {
    setError(null);
    if (mode === "local") {
      try {
        const result = saveLocal(change);
        remember(result);
        return Promise.resolve(result);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Could not save.";
        const result: BoardResult = {
          ok: false,
          error: message === "Could not save." || message.startsWith("Add ") || message.startsWith("Pick ") || message.startsWith("Title ") || message.startsWith("Note ") || message.startsWith("Due ") || message === "That item is gone."
            ? message
            : "Could not save.",
        };
        setError(result.error);
        return Promise.resolve(result);
      }
    }
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await server();
          remember(result);
          resolve(result);
        } catch {
          const result: BoardResult = { ok: false, error: "Could not save." };
          setError(result.error);
          resolve(result);
        }
      });
    });
  }

  function exportBoard() {
    const file = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jeune-jolie-board.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importBoard(file: File) {
    setError(null);
    void file.text().then(async (text) => {
      let parsed: Board;
      try {
        parsed = parseBoard(JSON.parse(text) as unknown);
      } catch {
        setError("Could not read that file.");
        return;
      }
      if (mode === "local") {
        try {
          writeStoredBoard(parsed);
          setBoard(parsed);
        } catch {
          setError("Could not save.");
        }
        return;
      }
      const result = await replaceBoard(parsed);
      remember(result);
    });
  }

  const itemsById = new Map(board.items.map((item) => [item.id, item]));
  const focusItems = board.focusOrder.flatMap((id) => {
    const item = itemsById.get(id);
    return item ? [item] : [];
  });
  const groups = GROUP_ORDER.map((status) => ({
    status,
    items: board.items.filter(
      (item) => item.status === status && (area === "All" || item.area === area),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="grid gap-10" aria-busy={pending}>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={secondaryClass} onClick={exportBoard}>
          Export
        </button>
        <button
          type="button"
          className={secondaryClass}
          onClick={() => importRef.current?.click()}
        >
          Import
        </button>
        <input
          ref={importRef}
          className="sr-only"
          type="file"
          accept="application/json,.json"
          aria-label="Import board JSON"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) importBoard(file);
          }}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="focus-heading">
        <h2 id="focus-heading" className="mb-3 text-base font-medium">
          Focus <span className="font-normal text-muted">{focusItems.length}</span>
        </h2>
        {focusItems.length === 0 ? (
          <p className="text-sm text-muted">Nothing in focus.</p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {focusItems.map((item, index) => (
              <li key={item.id}>
                <ItemCard
                  item={item}
                  formKey={`focus-${item.id}`}
                  focus
                  busy={pending}
                  canMoveUp={index > 0}
                  canMoveDown={index < focusItems.length - 1}
                  onSave={(input) =>
                    run(
                      (current) => updateItem(current, item.id, parseItemInput(input)),
                      () => editItem(item.id, input),
                    )
                  }
                  onDelete={() =>
                    run(
                      (current) => removeItem(current, item.id),
                      () => deleteItem(item.id),
                    )
                  }
                  onMoveUp={() =>
                    void run(
                      (current) => moveFocus(current, item.id, -1),
                      () => reorderFocus(item.id, -1),
                    )
                  }
                  onMoveDown={() =>
                    void run(
                      (current) => moveFocus(current, item.id, 1),
                      () => reorderFocus(item.id, 1),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="add-heading">
        <h2 id="add-heading" className="mb-3 text-base font-medium">
          Add
        </h2>
        <AddForm
          busy={pending}
          onAdd={(input: ItemInput) =>
            run(
              (current) => createItem(current, parseItemInput(input)),
              () => addItem(input),
            )
          }
        />
      </section>

      <section aria-labelledby="items-heading" className="grid gap-8">
        <div>
          <h2 id="items-heading" className="sr-only">
            Items
          </h2>
          <label className="grid max-w-sm gap-1 text-sm" htmlFor="area-filter">
            <span className="text-muted">Area</span>
            <select
              id="area-filter"
              className={`${fieldClass} h-11`}
              value={area}
              onChange={(event) => setArea(event.target.value as Area | "All")}
            >
              <option value="All">All</option>
              {AREAS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        {groups.length === 0 ? (
          <p className="text-sm text-muted">Nothing in this area.</p>
        ) : (
          groups.map((group) => (
            <section key={group.status} aria-labelledby={statusHeadingId(group.status)}>
              <h3 id={statusHeadingId(group.status)} className="mb-3 text-base font-medium">
                {group.status} <span className="font-normal text-muted">{group.items.length}</span>
              </h3>
              <ul className="m-0 grid list-none gap-3 p-0">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <ItemCard
                      item={item}
                      formKey={`list-${item.id}`}
                      titleLevel="h4"
                      busy={pending}
                      onSave={(input) =>
                        run(
                          (current) => updateItem(current, item.id, parseItemInput(input)),
                          () => editItem(item.id, input),
                        )
                      }
                      onDelete={() =>
                        run(
                          (current) => removeItem(current, item.id),
                          () => deleteItem(item.id),
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </section>
    </div>
  );
}
