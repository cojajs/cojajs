export class CojaRequest {
	public readonly bffId: string;
	public readonly path: string[];
	public readonly args: unknown[];

	constructor(options: {
		bffId: string;
		path: string[];
		args: unknown[];
	}) {
		this.bffId = options.bffId;
		this.path = options.path;
		this.args = options.args;
	}
}
