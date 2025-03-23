import type {
	Bff,
	GuestNameOf,
	ClientifiedRpcOf,
	RequestContextTypeOf,
} from "./Bff";
import type { Client } from "./Client";
import { CojaRequest } from "./CojaRequest";
import type { Runtime } from "./Runtime";
import { createRpcProxy } from "./createRpcProxy";

export class SsrClient<BffInstance extends Bff> implements Client<BffInstance> {
	private readonly runtime: Runtime<RequestContextTypeOf<BffInstance>>;
	private readonly requestContext: RequestContextTypeOf<BffInstance>;
	private readonly bffId: string;
	private readonly guestPath: string[];

	private constructor(options: {
		runtime: Runtime<RequestContextTypeOf<BffInstance>>;
		requestContext: RequestContextTypeOf<BffInstance>;
		bffId: string;
		guestPath?: string[];
	}) {
		this.runtime = options.runtime;
		this.requestContext = options.requestContext;
		this.bffId = options.bffId;
		this.guestPath = options.guestPath ?? [];
	}

	static create<BffInstance extends Bff>(options: {
		runtime: Runtime<RequestContextTypeOf<BffInstance>>;
		requestContext: RequestContextTypeOf<BffInstance>;
		bffId: string;
	}): SsrClient<BffInstance> {
		return new SsrClient(options);
	}

	forGuest(guestName: GuestNameOf<BffInstance>): Client<Bff> {
		return new SsrClient({
			runtime: this.runtime,
			requestContext: this.requestContext,
			bffId: this.bffId,
			guestPath: [...this.guestPath, guestName as string],
		});
	}

	get rpc(): ClientifiedRpcOf<BffInstance> {
		return createRpcProxy(async (rpcPath, args) => {
			const request = new CojaRequest({
				bffId: this.bffId,
				guestPath: this.guestPath,
				rpcPath,
				args,
			});

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
		}) as ClientifiedRpcOf<BffInstance>;
	}
}
