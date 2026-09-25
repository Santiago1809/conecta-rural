import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { ALOJAMIENTOS } from "@/lib/data";
import { getTurso } from "@/lib/turso";

const COMMENT_POINTS = 25;
const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, resource_type TEXT NOT NULL CHECK (resource_type IN ('destination', 'provider', 'package', 'experience', 'lodging')), resource_id TEXT NOT NULL, body TEXT NOT NULL CHECK (length(body) BETWEEN 10 AND 1000), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS point_transactions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, points INTEGER NOT NULL, reason TEXT NOT NULL, comment_id TEXT UNIQUE REFERENCES comments(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS lodging_discounts (id TEXT PRIMARY KEY, alojamiento_id TEXT NOT NULL UNIQUE, nombre TEXT NOT NULL, porcentaje INTEGER NOT NULL CHECK (porcentaje BETWEEN 1 AND 50), points_cost INTEGER NOT NULL CHECK (points_cost > 0), active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS redemptions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, discount_id TEXT NOT NULL REFERENCES lodging_discounts(id) ON DELETE CASCADE, redeemed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, discount_id))`,
  `CREATE INDEX IF NOT EXISTS comments_resource_idx ON comments(resource_type, resource_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS point_transactions_user_idx ON point_transactions(user_id, created_at DESC)`,
];

export type ResourceType = "destination" | "provider" | "package" | "experience" | "lodging";

export interface PublicComment {
  id: string;
  name: string;
  resourceType: ResourceType;
  resourceId: string;
  body: string;
  createdAt: string;
}

export async function ensureDatabase(): Promise<void> {
  const db = getTurso();
  await migrateCommentsTable(db);
  await db.batch(schemaStatements.map((sql) => ({ sql, args: [] })), "write");
  const discounts = ALOJAMIENTOS.slice(0, 3);
  await db.batch(
    discounts.map((alojamiento, index) => ({
      sql: "INSERT OR IGNORE INTO lodging_discounts (id, alojamiento_id, nombre, porcentaje, points_cost) VALUES (?, ?, ?, ?, ?)",
      args: [
        `discount-${alojamiento.destino_slug}`,
        alojamiento.destino_slug,
        alojamiento.nombre,
        index === 0 ? 10 : 8,
        index === 0 ? 100 : 75,
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

export async function listComments(resourceType: ResourceType, resourceId: string): Promise<PublicComment[]> {
  await ensureDatabase();
  const result = await getTurso().execute({
    sql: `SELECT comments.id, users.name, comments.resource_type, comments.resource_id, comments.body, comments.created_at
      FROM comments JOIN users ON users.id = comments.user_id
      WHERE comments.resource_type = ? AND comments.resource_id = ?
      ORDER BY comments.created_at DESC`,
    args: [resourceType, resourceId],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    resourceType: String(row.resource_type) as ResourceType,
    resourceId: String(row.resource_id),
    body: String(row.body),
    createdAt: String(row.created_at),
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
