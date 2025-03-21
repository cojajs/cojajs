import { CojaRequest } from "./CojaRequest";
import type { Runtime } from "./Runtime";

export class SsrClient<RequestContext> {
	private readonly runtime: Runtime<RequestContext>;
	private readonly requestContext: RequestContext;
	private readonly bffId: string;

	constructor(options: {
		runtime: Runtime<RequestContext>;
		requestContext: RequestContext;
		bffId: string;
	}) {
		this.runtime = options.runtime;
		this.requestContext = options.requestContext;
		this.bffId = options.bffId;
	}

	get rpc() {
		return createProxy(async (path, args) => {
			const request = new CojaRequest({ bffId: this.bffId, path, args });

			const bffReturn = await this.runtime.execute(
				request,
				this.requestContext,
			);

			if (bffReturn instanceof Response) {
				return bffReturn;
			}

			if (bffReturn instanceof Error) {
				return bffReturn;
			}

			return bffReturn;
		});
	}
}

const createProxy = (
	onApply: (path: string[], args: unknown[]) => unknown,
	path: string[] = [],
) =>
	new Proxy(() => {}, {
		get(_, prop: string) {
			return createProxy(onApply, [...path, prop]);
		},
		apply(_, __, args) {
			return onApply(path, args);
		},
	});
