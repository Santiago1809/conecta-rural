"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ResourceType, PublicComment } from "@/lib/db";
import { useSessionUser } from "@/lib/session-client";

// Server message from app/api/comments/route.ts when the POST is unauthenticated.
const AUTH_REQUIRED_MESSAGE = "Inicia sesión para comentar.";
// Prefix of the publish success message. Reaching it already required a session,
// so the action is "Ver mis puntos", not a sign-in prompt.
const PUBLISHED_PREFIX = "Comentario publicado.";

export default function CommentsSection({ resourceType, resourceId }: { resourceType: ResourceType; resourceId: string }) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user: sessionUser, loaded: sessionLoaded } = useSessionUser();

  function loadComments() {
    return fetch(`/api/comments?resourceType=${resourceType}&resourceId=${encodeURIComponent(resourceId)}`)
      .then((response) => response.json() as Promise<{ comments?: PublicComment[]; error?: string }>)
      .then((data) => {
        setComments(data.comments ?? []);
        if (data.error) setMessage(data.error);
        setLoading(false);
      });
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/comments?resourceType=${resourceType}&resourceId=${encodeURIComponent(resourceId)}`)
      .then((response) => response.json() as Promise<{ comments?: PublicComment[]; error?: string }>)
      .then((data) => {
        if (!active) return;
        setComments(data.comments ?? []);
        if (data.error) setMessage(data.error);
        setLoading(false);
      });
    return () => { active = false; };
  }, [resourceId, resourceType]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceType, resourceId, body }) });
    const data = await response.json() as { error?: string; points?: number };
    if (!response.ok) {
      setMessage(data.error ?? "No pudimos publicar tu comentario.");
      return;
    }
    setBody("");
    setMessage(`${PUBLISHED_PREFIX} Ganaste ${data.points} PUNTOS MI RUTA.`);
    await loadComments();
  }

  // No optimistic update: the server owns the balance, so refetch the list.
  async function toggleLike(commentId: string) {
    setMessage("");
    const response = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "No pudimos registrar tu me gusta.");
      return;
    }
    await loadComments();
  }

  // The sign-in link is only actionable for a signed-out visitor hitting the auth error.
  const showSignInLink = sessionLoaded && !sessionUser && message === AUTH_REQUIRED_MESSAGE;
  const showPointsLink = message.startsWith(PUBLISHED_PREFIX);

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-warm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">Experiencias reales</p>
        <h2 className="mt-1 font-headline text-2xl font-bold">Comentarios</h2>
      </div>
      {loading ? (
        <p className="text-sm text-ink/60">Cargando comentarios…</p>
      ) : comments.length ? (
        <div className="flex flex-col divide-y divide-inputborder/60">
          {comments.map((comment) => (
            <article key={comment.id} className="py-4 first:pt-0">
              <p className="font-semibold text-bosque">{comment.name}</p>
              <p className="mt-1 text-sm text-ink/80">{comment.body}</p>
              <button
                type="button"
                onClick={() => toggleLike(comment.id)}
                disabled={!sessionUser || comment.isAuthor}
                aria-pressed={comment.likedByMe}
                title={comment.isAuthor ? "Es tu propio comentario." : !sessionUser ? "Inicia sesión para dar me gusta." : undefined}
                className={`mt-2 rounded-[10px] border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${comment.likedByMe ? "border-terracota text-terracota" : "border-inputborder text-ink/70"}`}
              >
                {comment.likedByMe ? "Quitar me gusta" : "Me gusta"} · {comment.likes}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/60">Aún no hay comentarios. Sé la primera persona en compartir su experiencia.</p>
      )}
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor={`comment-${resourceType}-${resourceId}`} className="text-sm font-semibold">Comparte tu experiencia</label>
        <textarea id={`comment-${resourceType}-${resourceId}`} value={body} onChange={(event) => setBody(event.target.value)} minLength={10} maxLength={1000} required rows={4} className="rounded-[10px] border border-inputborder bg-white px-4 py-3 text-sm outline-none focus:border-bosque" placeholder="¿Qué debería saber otra persona antes de reservar?" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink/60">Cada comentario publicado suma 25 PUNTOS MI RUTA, y cada me gusta que reciba suma 15 más.</p>
          <button type="submit" className="rounded-[10px] bg-bosque px-4 py-2.5 text-sm font-semibold text-white">Publicar comentario</button>
        </div>
      </form>
      {message && (
        <p role="status" className="text-sm text-ink/70">
          {message}
          {showSignInLink && <>{" "}<Link href="/auth/sign-in" className="font-semibold text-terracota">Iniciar sesión</Link></>}
          {showPointsLink && <>{" "}<Link href="/puntos" className="font-semibold text-terracota">Ver mis puntos</Link></>}
        </p>
      )}
    </section>
  );
}
