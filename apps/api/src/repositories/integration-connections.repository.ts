import type { IntegrationConnectionRow, NewIntegrationConnectionRow } from '@debrief/db';
import { db, integrationConnections } from '@debrief/db';

export async function upsertConnection(
  values: Omit<NewIntegrationConnectionRow, 'id'>,
): Promise<IntegrationConnectionRow> {
  const [row] = await db
    .insert(integrationConnections)
    .values(values)
    .onConflictDoUpdate({
      target: [integrationConnections.userId, integrationConnections.provider],
      set: {
        encryptedCredentials: values.encryptedCredentials,
        metadata: values.metadata,
        connectedAt: new Date(),
      },
    })
    .returning();

  if (!row) {
    throw new Error('Failed to upsert integration connection');
  }
  return row;
}

export async function findConnection(
  userId: string,
  provider: string,
): Promise<IntegrationConnectionRow | undefined> {
  const connection = await db.query.integrationConnections.findFirst({
    where: {
      userId,
      provider,
    },
  });
  return connection;
}
