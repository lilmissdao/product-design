"use client";

import { useState } from "react";
import { formatDue } from "@/lib/format";
import type { BoardResult, Item, ItemInput } from "@/lib/model";
import { ItemFields } from "./item-fields";
import { NoteText } from "./note-text";
import { primaryClass, secondaryClass } from "./styles";

export function ItemCard({
  item,
  formKey,
  titleLevel = "h3",
  focus,
  canMoveUp,
  canMoveDown,
  busy,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: Item;
  formKey: string;
  titleLevel?: "h3" | "h4";
  focus?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  busy: boolean;
  onSave: (input: ItemInput) => Promise<BoardResult>;
  onDelete: () => Promise<BoardResult>;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [draft, setDraft] = useState<ItemInput>(toInput(item));

  function startEdit() {
    setDraft(toInput(item));
    setMode("edit");
  }

  return (
    <article className={`${focus ? "card-focus" : "card"} min-w-0 p-4 sm:p-5`}>
      {mode === "edit" ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave(draft).then((result) => {
              if (result.ok) setMode("view");
            });
          }}
        >
          <ItemFields
            idPrefix={formKey}
            value={draft}
            disabled={busy}
            onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={primaryClass} disabled={busy}>
              Save
            </button>
            <button
              type="button"
              className={secondaryClass}
              disabled={busy}
              onClick={() => setMode("view")}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {titleLevel === "h4" ? (
            <h4 className="text-base font-medium leading-6 break-words">{item.title}</h4>
          ) : (
            <h3 className="text-base font-medium leading-6 break-words">{item.title}</h3>
          )}
          {item.note ? <NoteText text={item.note} /> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 items-center rounded bg-wash px-2 text-xs">
              {item.area}
            </span>
            <span className="inline-flex h-6 items-center rounded bg-wash px-2 text-xs">
              {item.status}
            </span>
            <span
              className={`inline-flex h-6 items-center rounded px-2 text-xs ${
                item.priority === "High" ? "bg-wash text-blue" : "bg-wash text-foreground"
              }`}
            >
              {item.priority}
            </span>
            {item.due ? (
              <span className="text-xs text-muted">Due {formatDue(item.due)}</span>
            ) : null}
          </div>
          {mode === "delete" ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <p className="mr-1 text-sm">Delete this?</p>
              <button
                type="button"
                className={primaryClass}
                disabled={busy}
                aria-label={`Confirm delete ${item.title}`}
                onClick={() => {
                  void onDelete().then((result) => {
                    if (!result.ok) setMode("view");
                  });
                }}
              >
                Delete
              </button>
              <button
                type="button"
                className={secondaryClass}
                disabled={busy}
                onClick={() => setMode("view")}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={secondaryClass} disabled={busy} onClick={startEdit}>
                Edit
              </button>
              <button
                type="button"
                className={secondaryClass}
                disabled={busy}
                aria-label={`Delete ${item.title}`}
                onClick={() => setMode("delete")}
              >
                Delete
              </button>
              {focus ? (
                <>
                  <button
                    type="button"
                    className={secondaryClass}
                    disabled={busy || !canMoveUp}
                    aria-label={`Move up: ${item.title}`}
                    onClick={onMoveUp}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className={secondaryClass}
                    disabled={busy || !canMoveDown}
                    aria-label={`Move down: ${item.title}`}
                    onClick={onMoveDown}
                  >
                    Down
                  </button>
                </>
              ) : null}
            </div>
          )}
        </>
      )}
    </article>
  );
}

function toInput(item: Item): ItemInput {
  return {
    title: item.title,
    note: item.note,
    area: item.area,
    status: item.status,
    priority: item.priority,
    due: item.due,
  };
}
