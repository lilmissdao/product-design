import { Suspense } from "react";
import { BoardSection } from "@/components/board-section";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight">Jeune Jolie</h1>
        <p className="mt-1 text-sm text-muted">Product board</p>
      </header>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <BoardSection />
      </Suspense>
    </main>
  );
}
