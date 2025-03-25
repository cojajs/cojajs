import { AsyncLocalStorage } from "async_hooks";

export class RequestContext<RequestContextType> {
	private readonly requestContextStorage = new AsyncLocalStorage();

	useValue(): RequestContextType {
		return this.requestContextStorage.getStore() as RequestContextType;
	}

	run<T>(value: RequestContextType, fn: () => T): T {
		return this.requestContextStorage.run(value, fn);
	}
}
