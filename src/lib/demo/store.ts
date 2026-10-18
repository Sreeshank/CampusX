import { useSyncExternalStore } from "react";
import { createDemoEngine } from "./engine";
import { createSeed } from "./seed";
import type { DemoState } from "../../../shared/types";
const KEY = "campusx-starter-v1";
function load(): DemoState {
  try {
    const value = localStorage.getItem(KEY);
    if (value) {
      const parsed = JSON.parse(value);
      if (
        parsed.version === 1 &&
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.listings) &&
        parsed.operations
      )
        return parsed;
    }
  } catch {
    /* A fresh demo works when storage is unavailable/corrupt. */
  }
  return createSeed();
}
const engine = createDemoEngine(load(), (s) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    throw new Error(
      "Browser storage is unavailable or full. Enable local storage, remove large uploads, or reset the demo.",
    );
  }
});
export const api = engine.api;
export const useDemo = () =>
  useSyncExternalStore(engine.subscribe, engine.getSnapshot);
export function resetDemo() {
  localStorage.removeItem(KEY);
  window.location.assign("/home");
}
// Deliberately no cross-tab syncing: use the account switcher for local two-person workflows.
