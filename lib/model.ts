export const AREAS = [
  "Shampoo + Conditioner",
  "Copper Cream",
  "Scalp Spray",
  "Ferment Line",
  "Packaging",
  "Pricing",
  "Suppliers",
  "Research",
  "Other",
] as const;

export const STATUSES = ["Idea", "Next", "Doing", "Done", "On hold"] as const;

export const GROUP_ORDER = ["Doing", "Next", "Idea", "On hold", "Done"] as const;

export const PRIORITIES = ["High", "Med", "Low"] as const;

export type Area = (typeof AREAS)[number];
export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export type Item = {
  id: string;
  title: string;
  note: string;
  area: Area;
  status: Status;
  priority: Priority;
  due: string | null;
};

export type ItemInput = {
  title: string;
  note: string;
  area: Area;
  status: Status;
  priority: Priority;
  due: string | null;
};

export type Board = {
  items: Item[];
  focusOrder: string[];
};

export type BoardResult =
  | { ok: true; board: Board }
  | { ok: false; error: string };

const AREA_SET: ReadonlySet<string> = new Set(AREAS);
const STATUS_SET: ReadonlySet<string> = new Set(STATUSES);
const PRIORITY_SET: ReadonlySet<string> = new Set(PRIORITIES);

export function isFocusItem(item: Item): boolean {
  return item.priority === "High" && (item.status === "Next" || item.status === "Doing");
}

export function withFocus(board: Board): Board {
  const eligible = new Set(board.items.filter(isFocusItem).map((item) => item.id));
  const focusOrder: string[] = [];
  for (const id of board.focusOrder) {
    if (eligible.has(id) && !focusOrder.includes(id)) focusOrder.push(id);
  }
  for (const item of board.items) {
    if (eligible.has(item.id) && !focusOrder.includes(item.id)) focusOrder.push(item.id);
  }
  return { items: board.items, focusOrder };
}

export function createItem(board: Board, input: ItemInput): Board {
  const item: Item = { id: crypto.randomUUID(), ...input };
  return withFocus({ items: [item, ...board.items], focusOrder: board.focusOrder });
}

export function updateItem(board: Board, id: string, input: ItemInput): Board {
  if (!board.items.some((item) => item.id === id)) {
    throw new Error("That item is gone.");
  }
  const items = board.items.map((item) => (item.id === id ? { ...item, ...input, id } : item));
  return withFocus({ items, focusOrder: board.focusOrder });
}

export function removeItem(board: Board, id: string): Board {
  return withFocus({
    items: board.items.filter((item) => item.id !== id),
    focusOrder: board.focusOrder.filter((itemId) => itemId !== id),
  });
}

export function moveFocus(board: Board, id: string, direction: -1 | 1): Board {
  const next = withFocus(board);
  const index = next.focusOrder.indexOf(id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= next.focusOrder.length) return next;
  const focusOrder = next.focusOrder.slice();
  const swap = focusOrder[target];
  if (swap === undefined) return next;
  focusOrder[target] = focusOrder[index] ?? id;
  focusOrder[index] = swap;
  return { items: next.items, focusOrder };
}

export function parseItemInput(value: unknown): ItemInput {
  if (!value || typeof value !== "object") throw new Error("Could not save.");
  const raw = value as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) throw new Error("Add a title.");
  if (title.length > 160) throw new Error("Title is too long.");
  const note = typeof raw.note === "string" ? raw.note.trim() : "";
  if (note.length > 20000) throw new Error("Note is too long.");
  if (typeof raw.area !== "string" || !AREA_SET.has(raw.area)) throw new Error("Pick an area.");
  if (typeof raw.status !== "string" || !STATUS_SET.has(raw.status)) throw new Error("Pick a status.");
  if (typeof raw.priority !== "string" || !PRIORITY_SET.has(raw.priority)) {
    throw new Error("Pick a priority.");
  }
  return {
    title,
    note,
    area: raw.area as Area,
    status: raw.status as Status,
    priority: raw.priority as Priority,
    due: parseDue(raw.due),
  };
}

export function parseBoard(value: unknown): Board {
  if (!value || typeof value !== "object") throw new Error("The saved board could not be read.");
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.items)) throw new Error("The saved board could not be read.");
  const items = raw.items.map((entry) => parseStoredItem(entry));
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error("The saved board could not be read.");
    ids.add(item.id);
  }
  const focusOrder = Array.isArray(raw.focusOrder)
    ? raw.focusOrder.filter((id): id is string => typeof id === "string")
    : [];
  return withFocus({ items, focusOrder });
}

export function assertId(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9-]{1,80}$/.test(value)) {
    throw new Error("Could not save.");
  }
  return value;
}

function parseStoredItem(value: unknown): Item {
  if (!value || typeof value !== "object") throw new Error("The saved board could not be read.");
  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!/^[A-Za-z0-9-]{1,80}$/.test(id)) throw new Error("The saved board could not be read.");
  try {
    return { id, ...parseItemInput(raw) };
  } catch {
    throw new Error("The saved board could not be read.");
  }
}

function parseDue(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Due date is not valid.");
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Due date is not valid.");
  }
  return value;
}
