import { AsyncLocalStorage } from 'node:async_hooks';

type RequestContext = {
  correlationId: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getCorrelationId(): string | undefined {
  return requestContext.getStore()?.correlationId;
}
