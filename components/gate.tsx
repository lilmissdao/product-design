"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlock } from "@/app/actions";
import { fieldClass, primaryClass } from "./styles";

export function Gate() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setPending(true);
        void unlock(passcode)
          .then((result) => {
            if (result.ok) {
              router.refresh();
              return;
            }
            setPending(false);
            setError(result.error);
          })
          .catch(() => {
            setPending(false);
            setError("Could not continue.");
          });
      }}
    >
      <label className="grid gap-1 text-sm" htmlFor="passcode">
        <span className="text-muted">Passcode</span>
        <input
          id="passcode"
          name="passcode"
          type="password"
          className={`${fieldClass} h-11`}
          value={passcode}
          autoComplete="current-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={pending}
          onChange={(event) => setPasscode(event.target.value)}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div>
        <button type="submit" className={primaryClass} disabled={pending || passcode.length === 0}>
          Continue
        </button>
      </div>
    </form>
  );
}
