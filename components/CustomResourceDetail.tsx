"use client";

import Image from "next/image";
import { useState } from "react";
import CommentsSection from "@/components/CommentsSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import { formatCOP } from "@/lib/data";
import { addCustomPlanItem } from "@/lib/plan";
import { showToast } from "@/lib/toast";

interface Props {
  kind: "experience" | "lodging";
  name: string;
  resourceId: string;
  location: string;
  category: string;
  description: string;
  price: number;
  image: string;
  destination: string;
  destinationSlug: string;
  whatsapp?: string;
}

export default function CustomResourceDetail({
  kind,
  name,
  resourceId,
  location,
  category,
  description,
  price,
  image,
  destination,
  destinationSlug,
  whatsapp,
}: Props) {
  const [saved, setSaved] = useState(false);

  function saveToItinerary() {
    addCustomPlanItem({
      kind,
      id: resourceId,
      name,
      destination,
      destinationSlug,
      description,
      price,
      image,
    });
    setSaved(true);
    showToast(`${name} se añadió a tu itinerario.`);
  }

  return (
    <div className="flex flex-col gap-8 py-8">
      <article className="overflow-hidden rounded-3xl bg-card shadow-warm">
        <div className="relative aspect-video w-full sm:aspect-[2/1]">
          <Image src={image} alt={name} fill priority className="object-cover" />
        </div>
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-terracota">
            <span>{category}</span>
            <span aria-hidden="true">·</span>
            <span>{location}</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold sm:text-4xl">{name}</h1>
          <p className="max-w-3xl text-ink/70">{description}</p>
          <p className="text-lg font-bold text-bosque">
            {formatCOP(price)}{kind === "lodging" ? " / noche" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveToItinerary}
              className="rounded-[10px] bg-bosque px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bosque-hover"
            >
              {saved ? "Agregado al itinerario" : "Agregar al itinerario"}
            </button>
            {kind === "lodging" && whatsapp && (
              <WhatsAppButton
                phone={whatsapp}
                message={`Hola, quiero reservar alojamiento en ${name} (${location}).`}
                label="Reservar por WhatsApp"
              />
            )}
          </div>
        </div>
      </article>

      <CommentsSection resourceType={kind} resourceId={resourceId} />
    </div>
  );
}