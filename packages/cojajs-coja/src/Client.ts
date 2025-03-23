import type { Bff, GuestNameOf, ClientifiedRpcOf } from "./Bff";

export interface Client<BffInstance extends Bff> {
	rpc: ClientifiedRpcOf<BffInstance>;
	forGuest(guestName: GuestNameOf<BffInstance>): Client<Bff>;
}
