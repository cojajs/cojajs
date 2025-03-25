import type { Bff, ClientifiedRpcOf, GuestNameOf } from "./Bff";
import type { ClientRuntimeLink } from "./ClientRuntimeLink";
import { CojaRequest } from "./CojaRequest";
import { createRpcProxy } from "./createRpcProxy";

export class Client<BffInstance extends Bff> {
	private readonly clientRuntimeLink: ClientRuntimeLink;
	private readonly bffId: string;
	private readonly guestPath: string[];

	private constructor(options: {
		clientRuntimeLink: ClientRuntimeLink;
		bffId: string;
		guestPath?: string[];
	}) {
		this.clientRuntimeLink = options.clientRuntimeLink;
		this.bffId = options.bffId;
		this.guestPath = options.guestPath ?? [];
	}

	static create<BffInstance extends Bff>(options: {
		clientRuntimeLink: ClientRuntimeLink;
		bffId: string;
	}): Client<BffInstance> {
		return new Client(options);
	}

	forGuest(guestName: GuestNameOf<BffInstance>): Client<Bff> {
		return new Client({
			clientRuntimeLink: this.clientRuntimeLink,
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

			const cojaResponse = await this.clientRuntimeLink.execute(request);
			const userTypeMatchedResponse = cojaResponse.rematchUserSignatureType();

			return userTypeMatchedResponse;
		}) as ClientifiedRpcOf<BffInstance>;
	}
}
