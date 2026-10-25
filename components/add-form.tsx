"use client";

import { useState } from "react";
import type { BoardResult, ItemInput } from "@/lib/model";
import { ItemFields } from "./item-fields";
import { primaryClass } from "./styles";

const EMPTY: ItemInput = {
  title: "",
  note: "",
  area: "Other",
  status: "Idea",
  priority: "Med",
  due: null,
};

export function AddForm({
  busy,
  onAdd,
}: {
  busy: boolean;
  onAdd: (input: ItemInput) => Promise<BoardResult>;
}) {
  const [draft, setDraft] = useState<ItemInput>(EMPTY);

  return (
    <form
      className="card grid gap-4 p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void onAdd(draft).then((result) => {
          if (result.ok) setDraft(EMPTY);
        });
      }}
    >
      <ItemFields
        idPrefix="add"
        value={draft}
        disabled={busy}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      />
      <div>
        <button type="submit" className={primaryClass} disabled={busy || !draft.title.trim()}>
          Add
        </button>
      </div>
    </form>
  );
}
