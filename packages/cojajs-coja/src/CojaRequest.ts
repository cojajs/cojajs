type RespondFunction = (response: Response | PromiseLike<Response>) => void;

export class CojaRequest {
	public readonly response: Promise<Response>;
	public readonly respond: RespondFunction;

	constructor(
		public readonly bffId: string,
		public readonly path: string[],
		public readonly args: unknown[],
	) {
		let respond: RespondFunction | null = null;

		this.response = new Promise<Response>((resolve) => {
			respond = resolve;
		});

		if (respond === null) {
			throw new Error("[miracle-alert] respond is null.");
		}

		this.respond = respond;
	}
}
