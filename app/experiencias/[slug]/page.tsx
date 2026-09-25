import { notFound } from "next/navigation";
import CustomResourceDetail from "@/components/CustomResourceDetail";
import { experienciaSlug, EXPERIENCIAS, getDestino, getExperiencia } from "@/lib/data";

export function generateStaticParams() {
  return EXPERIENCIAS.map((experiencia) => ({ slug: experienciaSlug(experiencia) }));
}

export default async function ExperienciaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiencia = getExperiencia(slug);
  if (!experiencia) notFound();
  const destino = getDestino(experiencia.destino_slug);

  return (
    <CustomResourceDetail
      kind="experience"
      name={experiencia.nombre}
      resourceId={`experience:${experiencia.destino_slug}:${experiencia.nombre}`}
      location={destino?.nombre ?? experiencia.destino_slug}
      category={experiencia.categoria}
      description={experiencia.descripcion}
      price={experiencia.precio}
      image={experiencia.foto}
      destination={destino?.nombre ?? experiencia.destino_slug}
      destinationSlug={experiencia.destino_slug}
    />
  );
}