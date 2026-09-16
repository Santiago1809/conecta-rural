import type { ItinerarioItem } from "@/lib/data";

// Vertical itinerary timeline with a dashed terracotta spine.
export default function Timeline({ items }: { items: ItinerarioItem[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-dashed border-terracota pl-6">
      {items.map((item) => (
        <li key={`${item.hora}-${item.titulo}`} className="relative pb-6 last:pb-0">
          <span
            aria-hidden
            className="absolute -left-[33px] top-1 h-3 w-3 rounded-full bg-terracota ring-4 ring-canvas"
          />
          <p className="text-xs font-bold uppercase tracking-wide text-terracota">
            {item.hora}
          </p>
          <h4 className="font-headline text-base font-bold text-ink">
            {item.titulo}
          </h4>
          <p className="text-sm text-ink/70">{item.detalle}</p>
        </li>
      ))}
    </ol>
  );
}
