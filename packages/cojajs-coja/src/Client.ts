import type { Bff, GuestNameOf, RpcOf } from "./Bff";

export interface Client<BffInstance extends Bff> {
	rpc: RpcOf<BffInstance>;
	forGuest(guestName: GuestNameOf<BffInstance>): Client<Bff>;
}
