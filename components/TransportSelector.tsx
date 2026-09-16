"use client";

import { TRANSPORTE_LABELS } from "@/lib/data";

interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

// Accessible radio-group transport picker (bus, chiva, 4x4, horse/hike).
export default function TransportSelector({ options, value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Medio de transporte" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`rounded-[10px] border px-4 py-3 text-left text-sm font-medium transition ${
              selected
                ? "border-bosque bg-bosque text-white shadow-warm"
                : "border-inputborder bg-white text-ink hover:border-bosque"
            }`}
          >
            {TRANSPORTE_LABELS[opt] ?? opt}
          </button>
        );
      })}
    </div>
  );
}
