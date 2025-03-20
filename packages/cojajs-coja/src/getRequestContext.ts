import { AsyncLocalStorage } from "node:async_hooks";

export const requestContextStorage = new AsyncLocalStorage();

export function getRequestContext<T>(): T {
	return requestContextStorage.getStore() as T;
}
