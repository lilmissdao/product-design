"use client";

import dynamic from "next/dynamic";
import type { Board } from "@/lib/model";

const BoardView = dynamic(
  () => import("./board-view").then((mod) => mod.BoardView),
  {
    ssr: false,
    loading: () => <p className="text-sm text-muted">Loading…</p>,
  },
);

export function LocalBoardView({ initial }: { initial: Board }) {
  return <BoardView mode="local" initial={initial} />;
}
