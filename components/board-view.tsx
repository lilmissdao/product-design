"use client";

import { useState, useTransition } from "react";
import { addItem, deleteItem, editItem, reorderFocus } from "@/app/actions";
import { AREAS, GROUP_ORDER, type Area, type Board, type BoardResult, type ItemInput } from "@/lib/model";
import { AddForm } from "./add-form";
import { ItemCard } from "./item-card";
import { fieldClass } from "./styles";

function statusHeadingId(status: string): string {
  return `status-${status.replaceAll(" ", "-").toLowerCase()}`;
}

export function BoardView({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);
  const [area, setArea] = useState<Area | "All">("All");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<BoardResult>): Promise<BoardResult> {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await task();
          if (result.ok) setBoard(result.board);
          else setError(result.error);
          resolve(result);
        } catch {
          const result: BoardResult = { ok: false, error: "Could not save." };
          setError(result.error);
          resolve(result);
        }
      });
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
                  onSave={(input) => run(() => editItem(item.id, input))}
                  onDelete={() => run(() => deleteItem(item.id))}
                  onMoveUp={() => void run(() => reorderFocus(item.id, -1))}
                  onMoveDown={() => void run(() => reorderFocus(item.id, 1))}
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
          onAdd={(input: ItemInput) => run(() => addItem(input))}
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
                      onSave={(input) => run(() => editItem(item.id, input))}
                      onDelete={() => run(() => deleteItem(item.id))}
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
