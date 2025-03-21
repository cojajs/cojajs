export class Bff<Rpc> {
	public readonly rpc: Rpc;

	constructor(options: {
		rpc: Rpc;
	}) {
		this.rpc = options.rpc;
	}
}
