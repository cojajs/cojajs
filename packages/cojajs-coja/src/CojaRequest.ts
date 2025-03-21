export class CojaRequest {
	public readonly bffId: string;
	public readonly guestPath: string[];
	public readonly rpcPath: string[];
	public readonly args: unknown[];

	constructor(options: {
		bffId: string;
		guestPath: string[];
		rpcPath: string[];
		args: unknown[];
	}) {
		this.bffId = options.bffId;
		this.guestPath = options.guestPath;
		this.rpcPath = options.rpcPath;
		this.args = options.args;
	}
}
