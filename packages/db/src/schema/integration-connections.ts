import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const integrationConnections = pgTable(
  "integration_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // e.g. "slack" — free text, not an enum, so a new integration never needs a schema migration.
    encryptedCredentials: text("encrypted_credentials").notNull(), // see apps/api/lib/encryption.ts
    metadata: jsonb("metadata"), // e.g. { teamName, channelName } — not secret, safe in plaintext
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One active connection per user per provider — reconnecting replaces
    // it (upsert) rather than creating a second row.
    uniqueIndex("integration_connections_user_provider_idx").on(table.userId, table.provider),
  ],
);

export type IntegrationConnectionRow = typeof integrationConnections.$inferSelect;
export type NewIntegrationConnectionRow = typeof integrationConnections.$inferInsert;
