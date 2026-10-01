import { defineRelations } from 'drizzle-orm';
import * as schema from './schema/index.js';

export const relations = defineRelations(schema, (r) => ({
  runs: {
    user: r.one.users({
      from: r.runs.userId,
      to: r.users.id,
    }),
  },
  users: {
    runs: r.many.runs(),
  },
}));
