// Travel-plan persistence in localStorage.

import { PLAN_STORAGE_KEY } from "./env";

export interface DestinationPlanItem {
  slug: string;
  fecha: string;
  transporte: string;
  kind?: "destination";
}

export interface CustomPlanItem {
  kind: "experience" | "lodging";
  id: string;
  name: string;
  destination: string;
  destinationSlug: string;
  description: string;
  price: number;
  image?: string;
}

export type PlanItem = DestinationPlanItem | CustomPlanItem;

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
export function upsertPlanItem(item: DestinationPlanItem): PlanItem[] {
  const rest = loadPlan().filter(
    (p) => isCustomPlanItem(p) || p.slug !== item.slug,
  );
  const next = [...rest, item];
  savePlan(next);
  return next;
}

export function removePlanItem(slug: string): PlanItem[] {
  const next = loadPlan().filter((p) => isCustomPlanItem(p) || p.slug !== slug);
  savePlan(next);
  return next;
}

export function addCustomPlanItem(item: CustomPlanItem): PlanItem[] {
  const next = [...loadPlan().filter((p) => !isCustomPlanItem(p) || p.id !== item.id), item];
  savePlan(next);
  return next;
}

export function removeCustomPlanItem(id: string): PlanItem[] {
  const next = loadPlan().filter((item) => !isCustomPlanItem(item) || item.id !== id);
  savePlan(next);
  return next;
}

export function isCustomPlanItem(item: PlanItem): item is CustomPlanItem {
  return item.kind === "experience" || item.kind === "lodging";
}
