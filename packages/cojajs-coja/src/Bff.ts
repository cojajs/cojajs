import type { RequestContext } from "./RequestContext";

export class Bff<
	RequestContextType = unknown,
	Rpc = unknown,
	GuestName extends never | string = string,
> {
	public readonly rpc: Rpc;
	public readonly guests: Record<GuestName, Bff>;
	public readonly requestContext?: RequestContext<RequestContextType>;

	constructor(options: {
		rpc: Rpc;
		guests?: Record<GuestName, Bff>;
		requestContext?: RequestContext<RequestContextType>;
	}) {
		this.rpc = options.rpc;
		this.guests = options.guests ?? ({} as Record<GuestName, Bff>);
		this.requestContext = options.requestContext;
	}
}

export type RequestContextTypeOf<BffInstance extends Bff> =
	BffInstance extends Bff<
		infer RequestContextType,
		infer _Rpc,
		infer _GuestName
	>
		? RequestContextType
		: never;

export type GuestNameOf<BffInstance extends Bff> = BffInstance extends Bff<
	infer _RequestContextType,
	infer _Rpc,
	infer GuestName
>
	? GuestName
	: never;

export type ClientifiedRpcOf<BffInstance extends Bff> =
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	RpcOf<BffInstance> extends (...args: any[]) => any
		? PromisifyIfFunction<RpcOf<BffInstance>>
		: // biome-ignore lint/suspicious/noExplicitAny: <explanation>
			RpcOf<BffInstance> extends Record<string, any>
			? {
					[K in keyof RpcOf<BffInstance>]: ClientifiedRpcOf<
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						Bff<RpcOf<BffInstance>[K], any>
					>;
				}
			: RpcOf<BffInstance>;

type RpcOf<BffInstance extends Bff> = BffInstance extends Bff<
	infer _RequestContextType,
	infer Rpc,
	infer _GuestName
>
	? Rpc
	: never;

type PromisifyIfFunction<T> = T extends (...args: infer Args) => infer Return
	? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
		Return extends Promise<any>
		? T
		: (...args: Args) => Promise<Return>
	: T;
