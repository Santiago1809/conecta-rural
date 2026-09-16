// Travel-plan persistence in localStorage.

import { PLAN_STORAGE_KEY } from "./env";

export interface PlanItem {
  slug: string;
  fecha: string;
  transporte: string;
}

const isBrowser = () => typeof window !== "undefined";

export function loadPlan(): PlanItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlanItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePlan(items: PlanItem[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(items));
}

/** Adds or replaces the entry for the same destino slug. */
export function upsertPlanItem(item: PlanItem): PlanItem[] {
  const rest = loadPlan().filter((p) => p.slug !== item.slug);
  const next = [...rest, item];
  savePlan(next);
  return next;
}

export function removePlanItem(slug: string): PlanItem[] {
  const next = loadPlan().filter((p) => p.slug !== slug);
  savePlan(next);
  return next;
}
