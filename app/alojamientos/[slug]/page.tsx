import { notFound } from "next/navigation";
import CustomResourceDetail from "@/components/CustomResourceDetail";
import { alojamientoSlug, ALOJAMIENTOS, getAlojamiento } from "@/lib/data";

export function generateStaticParams() {
  return ALOJAMIENTOS.map((alojamiento) => ({ slug: alojamientoSlug(alojamiento) }));
}

export default async function AlojamientoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const alojamiento = getAlojamiento(slug);
  if (!alojamiento) notFound();

  return (
    <CustomResourceDetail
      kind="lodging"
      name={alojamiento.nombre}
      resourceId={`lodging:${alojamiento.destino_slug}:${alojamiento.nombre}`}
      location={`${alojamiento.municipio} · ${alojamiento.vereda}`}
      category="Alojamiento"
      description={alojamiento.descripcion}
      price={alojamiento.precio}
      image={alojamiento.foto}
      destination={alojamiento.municipio}
      destinationSlug={alojamiento.destino_slug}
      whatsapp={alojamiento.whatsapp}
    />
  );
}