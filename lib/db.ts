import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { ALOJAMIENTOS } from "@/lib/data";
import { getTurso } from "@/lib/turso";

const COMMENT_POINTS = 25;
const LIKE_POINTS = 15;
// Points cost per discount. The catalog was repriced twice: +50% (100 -> 150,
// 75 -> 113) and then +50% again as `current / (1 - 0.5)` (150 -> 300,
// 113 -> 226). Each entry lists every cost we have shipped alongside the final
// one, so the seed and the migration can never disagree and the migration
// converges in one call from any past generation.
// ponytail: 226, not 225 — each rebalance applies to the value the previous one
// produced, not to the original base. Recomputing from the base would drift.
const DISCOUNT_COSTS = {
  first: { superseded: [100, 150], cost: 300 },
  rest: { superseded: [75, 113], cost: 226 },
} as const;
const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, resource_type TEXT NOT NULL CHECK (resource_type IN ('destination', 'provider', 'package', 'experience', 'lodging')), resource_id TEXT NOT NULL, body TEXT NOT NULL CHECK (length(body) BETWEEN 10 AND 1000), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS point_transactions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, points INTEGER NOT NULL, reason TEXT NOT NULL, comment_id TEXT UNIQUE REFERENCES comments(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS lodging_discounts (id TEXT PRIMARY KEY, alojamiento_id TEXT NOT NULL UNIQUE, nombre TEXT NOT NULL, porcentaje INTEGER NOT NULL CHECK (porcentaje BETWEEN 1 AND 50), points_cost INTEGER NOT NULL CHECK (points_cost > 0), active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS redemptions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, discount_id TEXT NOT NULL REFERENCES lodging_discounts(id) ON DELETE CASCADE, redeemed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, discount_id))`,
  `CREATE TABLE IF NOT EXISTS comment_likes (id TEXT PRIMARY KEY, comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(comment_id, user_id))`,
  `CREATE INDEX IF NOT EXISTS comments_resource_idx ON comments(resource_type, resource_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS point_transactions_user_idx ON point_transactions(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS comment_likes_comment_idx ON comment_likes(comment_id)`,
];

export type ResourceType = "destination" | "provider" | "package" | "experience" | "lodging";

export interface PublicComment {
  id: string;
  name: string;
  resourceType: ResourceType;
  resourceId: string;
  body: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  isAuthor: boolean;
}

export async function ensureDatabase(): Promise<void> {
  const db = getTurso();
  await migrateCommentsTable(db);
  await db.batch(schemaStatements.map((sql) => ({ sql, args: [] })), "write");
  await migrateDiscountCosts(db);
  const discounts = ALOJAMIENTOS.slice(0, 3);
  await db.batch(
    discounts.map((alojamiento, index) => ({
      sql: "INSERT OR IGNORE INTO lodging_discounts (id, alojamiento_id, nombre, porcentaje, points_cost) VALUES (?, ?, ?, ?, ?)",
      args: [
        `discount-${alojamiento.destino_slug}`,
        alojamiento.destino_slug,
        alojamiento.nombre,
        index === 0 ? 10 : 8,
        (index === 0 ? DISCOUNT_COSTS.first : DISCOUNT_COSTS.rest).cost,
      ],
    })),
    "write",
  );
}

async function migrateCommentsTable(db: ReturnType<typeof getTurso>): Promise<void> {
  const result = await db.execute("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'comments'");
  const currentSql = String(result.rows[0]?.sql ?? "");
  if (!currentSql || currentSql.includes("'lodging'")) return;

  await db.batch(
    [
      { sql: "CREATE TABLE comments_new (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, resource_type TEXT NOT NULL CHECK (resource_type IN ('destination', 'provider', 'package', 'experience', 'lodging')), resource_id TEXT NOT NULL, body TEXT NOT NULL CHECK (length(body) BETWEEN 10 AND 1000), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)", args: [] },
      { sql: "INSERT INTO comments_new (id, user_id, resource_type, resource_id, body, created_at) SELECT id, user_id, resource_type, resource_id, body, created_at FROM comments", args: [] },
      { sql: "CREATE TABLE point_transactions_new (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, points INTEGER NOT NULL, reason TEXT NOT NULL, comment_id TEXT UNIQUE REFERENCES comments_new(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)", args: [] },
      { sql: "INSERT INTO point_transactions_new (id, user_id, points, reason, comment_id, created_at) SELECT id, user_id, points, reason, comment_id, created_at FROM point_transactions", args: [] },
      { sql: "DROP TABLE point_transactions", args: [] },
      { sql: "DROP TABLE comments", args: [] },
      { sql: "ALTER TABLE comments_new RENAME TO comments", args: [] },
      { sql: "ALTER TABLE point_transactions_new RENAME TO point_transactions", args: [] },
    ],
    "write",
  );
}

// Idempotent rebalance of the discount catalog. The seed above runs with
// INSERT OR IGNORE, so editing the seed numbers never touches a row that is
// already deployed — this UPDATE is what moves existing costs. Each statement
// sets a constant and matches every cost we have previously shipped, so a row
// converges in a single call and a later call no longer matches: idempotent.
// Never rewrite this as `points_cost = points_cost * 1.5` or similar:
// ensureDatabase() runs on nearly every request, so that would compound forever.
async function migrateDiscountCosts(db: ReturnType<typeof getTurso>): Promise<void> {
  await db.batch(
    Object.values(DISCOUNT_COSTS).map(({ superseded, cost }) => ({
      sql: `UPDATE lodging_discounts SET points_cost = ${cost} WHERE points_cost IN (${superseded.join(", ")})`,
      args: [],
    })),
    "write",
  );
}

export async function findUserByEmail(email: string) {
  const result = await getTurso().execute({
    sql: "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    args: [email.toLowerCase()],
  });
  return result.rows[0] as unknown as { id: string; name: string; email: string; password_hash: string } | undefined;
}

export async function createUser(name: string, email: string, password: string) {
  await ensureDatabase();
  const normalizedEmail = email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) throw new Error("Este correo ya está registrado.");
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  await getTurso().execute({
    sql: "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    args: [id, name.trim(), normalizedEmail, passwordHash],
  });
  return { id, name: name.trim(), email: normalizedEmail };
}

export async function listComments(resourceType: ResourceType, resourceId: string, viewerId?: string): Promise<PublicComment[]> {
  await ensureDatabase();
  // viewerId is compared against "" when the visitor is signed out, and user ids
  // are UUIDs, so liked_by_me / is_author are simply 0 for an anonymous read.
  const viewer = viewerId ?? "";
  const result = await getTurso().execute({
    sql: `SELECT comments.id, users.name, comments.resource_type, comments.resource_id, comments.body, comments.created_at,
      (SELECT COUNT(*) FROM comment_likes WHERE comment_likes.comment_id = comments.id) AS likes,
      EXISTS(SELECT 1 FROM comment_likes WHERE comment_likes.comment_id = comments.id AND comment_likes.user_id = ?) AS liked_by_me,
      comments.user_id = ? AS is_author
      FROM comments JOIN users ON users.id = comments.user_id
      WHERE comments.resource_type = ? AND comments.resource_id = ?
      ORDER BY comments.created_at DESC`,
    args: [viewer, viewer, resourceType, resourceId],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    resourceType: String(row.resource_type) as ResourceType,
    resourceId: String(row.resource_id),
    body: String(row.body),
    createdAt: String(row.created_at),
    likes: Number(row.likes ?? 0),
    likedByMe: Boolean(row.liked_by_me),
    isAuthor: Boolean(row.is_author),
  }));
}

export async function createComment(userId: string, resourceType: ResourceType, resourceId: string, body: string) {
  await ensureDatabase();
  const id = randomUUID();
  await getTurso().batch(
    [
      { sql: "INSERT INTO comments (id, user_id, resource_type, resource_id, body) VALUES (?, ?, ?, ?, ?)", args: [id, userId, resourceType, resourceId, body.trim()] },
      { sql: "INSERT INTO point_transactions (id, user_id, points, reason, comment_id) VALUES (?, ?, ?, ?, ?)", args: [randomUUID(), userId, COMMENT_POINTS, "Comentario publicado", id] },
    ],
    "write",
  );
  return { id, points: COMMENT_POINTS };
}

export type CommentLikeResult =
  | { ok: true; liked: boolean; points: number }
  | { ok: false; reason: "not_found" | "self_like"; error: string };

// Toggles a like and moves LIKE_POINTS to/from the comment AUTHOR. The ledger
// row carries only the balance: point_transactions.comment_id is UNIQUE and
// already claimed by the publish transaction, so attribution lives in
// comment_likes and comment_id stays NULL here.
export async function toggleCommentLike(userId: string, commentId: string): Promise<CommentLikeResult> {
  await ensureDatabase();
  const db = getTurso();
  const comment = await db.execute({ sql: "SELECT user_id FROM comments WHERE id = ?", args: [commentId] });
  const authorId = comment.rows[0] ? String(comment.rows[0].user_id) : "";
  if (!authorId) return { ok: false, reason: "not_found", error: "El comentario no existe." };
  if (authorId === userId) return { ok: false, reason: "self_like", error: "No puedes dar me gusta a tu propio comentario." };

  const existing = await db.execute({ sql: "SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?", args: [commentId, userId] });
  const liked = existing.rows.length > 0;
  await db.batch(
    liked
      ? [
          { sql: "DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?", args: [commentId, userId] },
          { sql: "INSERT INTO point_transactions (id, user_id, points, reason) VALUES (?, ?, ?, ?)", args: [randomUUID(), authorId, -LIKE_POINTS, "Comentario sin me gusta"] },
        ]
      : [
          { sql: "INSERT INTO comment_likes (id, comment_id, user_id) VALUES (?, ?, ?)", args: [randomUUID(), commentId, userId] },
          { sql: "INSERT INTO point_transactions (id, user_id, points, reason) VALUES (?, ?, ?, ?)", args: [randomUUID(), authorId, LIKE_POINTS, "Comentario con me gusta"] },
        ],
    "write",
  );
  return { ok: true, liked: !liked, points: liked ? -LIKE_POINTS : LIKE_POINTS };
}

export async function getPointsSummary(userId: string) {
  await ensureDatabase();
  const [balance, discounts, redeemed] = await Promise.all([
    getTurso().execute({ sql: "SELECT COALESCE(SUM(points), 0) AS balance FROM point_transactions WHERE user_id = ?", args: [userId] }),
    getTurso().execute({ sql: "SELECT id, alojamiento_id, nombre, porcentaje, points_cost FROM lodging_discounts WHERE active = 1 ORDER BY points_cost", args: [] }),
    getTurso().execute({ sql: "SELECT discount_id FROM redemptions WHERE user_id = ?", args: [userId] }),
  ]);
  const redeemedIds = new Set(redeemed.rows.map((row) => String(row.discount_id)));
  return {
    balance: Number(balance.rows[0]?.balance ?? 0),
    discounts: discounts.rows.map((row) => ({
      id: String(row.id),
      alojamientoId: String(row.alojamiento_id),
      nombre: String(row.nombre),
      porcentaje: Number(row.porcentaje),
      pointsCost: Number(row.points_cost),
      redeemed: redeemedIds.has(String(row.id)),
    })),
  };
}

export async function redeemDiscount(userId: string, discountId: string) {
  await ensureDatabase();
  const db = getTurso();
  const discount = await db.execute({ sql: "SELECT points_cost FROM lodging_discounts WHERE id = ? AND active = 1", args: [discountId] });
  const pointsCost = Number(discount.rows[0]?.points_cost ?? 0);
  if (!pointsCost) throw new Error("Descuento no disponible.");
  const summary = await getPointsSummary(userId);
  if (summary.balance < pointsCost) throw new Error("Todavía no tienes suficientes puntos.");
  await db.batch(
    [
      { sql: "INSERT INTO redemptions (id, user_id, discount_id) VALUES (?, ?, ?)", args: [randomUUID(), userId, discountId] },
      { sql: "INSERT INTO point_transactions (id, user_id, points, reason) VALUES (?, ?, ?, ?)", args: [randomUUID(), userId, -pointsCost, "Canje de descuento de alojamiento"] },
    ],
    "write",
  );
}
