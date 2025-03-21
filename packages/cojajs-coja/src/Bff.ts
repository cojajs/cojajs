export class Bff<Rpc = unknown, GuestName extends never | string = string> {
	public readonly rpc: Rpc;
	public readonly guests: Record<GuestName, Bff<unknown, string>>;

	constructor(options: {
		rpc: Rpc;
		guests?: Record<GuestName, Bff<unknown, string>>;
	}) {
		this.rpc = options.rpc;
		this.guests =
			options.guests ?? ({} as Record<GuestName, Bff<unknown, string>>);
	}
}

export type GuestNameOf<BffInstance extends Bff> = BffInstance extends Bff<
	infer _Rpc,
	infer GuestName
>
	? GuestName
	: never;

export type RpcOf<BffInstance extends Bff> = BffInstance extends Bff<
	infer Rpc,
	infer _GuestName
>
	? Rpc
	: never;
