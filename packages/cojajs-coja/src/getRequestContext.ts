import { AsyncLocalStorage } from "node:async_hooks";

export const requestContextStorage = new AsyncLocalStorage();

export function getRequestContext<RequestContext>(): RequestContext {
	return requestContextStorage.getStore() as RequestContext;
}
