import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const BOARD_COOKIE = "jj_board";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function passcodeRequired(): boolean {
  return Boolean(process.env.BOARD_PASSCODE);
}

export function passcodeMatches(input: string): boolean {
  const passcode = process.env.BOARD_PASSCODE;
  if (!passcode) return true;
  const actual = Buffer.from(seal(input));
  const expected = Buffer.from(seal(passcode));
  return timingSafeEqual(actual, expected);
}

export async function isAuthed(): Promise<boolean> {
  const passcode = process.env.BOARD_PASSCODE;
  if (!passcode) return true;
  const jar = await cookies();
  const got = jar.get(BOARD_COOKIE)?.value;
  if (!got) return false;
  const actual = Buffer.from(got);
  const expected = Buffer.from(seal(passcode));
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export async function grantAccess(): Promise<void> {
  const passcode = process.env.BOARD_PASSCODE;
  if (!passcode) return;
  const jar = await cookies();
  jar.set(BOARD_COOKIE, seal(passcode), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

function seal(value: string): string {
  return createHmac("sha256", "jeune-jolie-product-board").update(value).digest("hex");
}
