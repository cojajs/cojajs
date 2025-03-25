import type { Bff } from "./Bff";
import type { BffFetcher } from "./BffFetcher";
import type { CojaRequest } from "./CojaRequest";

export class Runtime<RequestContextValue> {
	private readonly bffFetcher: BffFetcher;

	constructor(options: { bffFetcher: BffFetcher }) {
		this.bffFetcher = options.bffFetcher;
	}

	async execute(
		request: CojaRequest,
		requestContextValue: RequestContextValue,
	): Promise<Response> {
		try {
			const topLevelBff = await this.bffFetcher.fetch(request.bffId);

			this.assertBff(request.bffId, topLevelBff);

			const requestedBff = this.resolveGuestPath(
				topLevelBff,
				request.guestPath,
			);

			this.assertBff(this.stringifyGuestPath(request), requestedBff);

			const bffFunction = this.getBffFunction(requestedBff, request);

			const requestContext = requestedBff.requestContext;

			const cojaResponse = await (requestContext
				? requestContext.run(requestContextValue, () =>
						bffFunction(...request.args),
					)
				: bffFunction(...request.args));

			if (cojaResponse instanceof Response) {
				return cojaResponse;
			}

			if (cojaResponse instanceof Error) {
				return this.responseFromError(cojaResponse);
			}

			return new Response(JSON.stringify({ data: cojaResponse }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			if (error instanceof Error) {
				return this.responseFromError(error);
			}

			return this.responseFromError(new Error("Unknown error"));
		}
	}

	private responseFromError(error: Error): Response {
		return new Response(JSON.stringify({ error: { message: error.message } }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	private stringifyGuestPath(request: CojaRequest): string {
		return [request.bffId, ...request.guestPath.map((x) => `guest(${x})`)].join(
			".",
		);
	}

	private resolveGuestPath(bff: Bff, guestPath: string[]): Bff {
		let step = bff;
		for (const segment of guestPath) {
			step = step.guests[segment];

			if (step === null) {
				throw new Error(
					`[bad-request] Expected object at path ${guestPath.join(".")}, but got null.`,
				);
			}
		}

		return step;
	}

	private assertBff(bffId: string, bff: unknown): asserts bff is Bff {
		if (bff === null) {
			throw new Error(`[bad-request] Bff not found for bffId ${bffId}.`);
		}

		if (typeof bff !== "object") {
			throw new Error(
				`[bad-bff] Expected object for bffId ${bffId}, but got ${typeof bff}.`,
			);
		}

		if (!("rpc" in bff)) {
			throw new Error(
				`[bad-bff] Expected object with rpc property for bffId ${bffId}.`,
			);
		}

		if (!("guests" in bff)) {
			throw new Error(
				`[bad-bff] Expected object with guests property for bffId ${bffId}.`,
			);
		}
	}

	private getBffFunction(
		bff: { rpc: unknown },
		request: CojaRequest,
	): (...args: unknown[]) => unknown {
		let step = bff.rpc;
		let parentObject = null;
		const pathTaken: string[] = [];

		for (const segment of request.rpcPath) {
			if (step === null) {
				throw new Error(
					`[bad-request] Expected object at path ${pathTaken.join(".")}, but got null.`,
				);
			}

			if (typeof step !== "object" && typeof step !== "function") {
				throw new Error(
					`[bad-request] Expected object at path ${pathTaken.join(".")}, but got ${typeof step}.`,
				);
			}

			if (!(segment in step)) {
				throw new Error(
					`[bad-request] Expected object to have property ${segment} at path ${pathTaken.join(".")}.`,
				);
			}

			parentObject = step;
			// @ts-expect-error: biome-ignore lint/complexity/noBannedTypes: already checked using segment in step
			step = step[segment];
			pathTaken.push(segment);
		}

		if (typeof step === "undefined") {
			throw new Error(
				`[bad-request] Expected function at path ${pathTaken.join(".")}, but got undefined.`,
			);
		}

		if (typeof step !== "function") {
			throw new Error(
				`[bad-request] Expected function at path ${pathTaken.join(".")}, but got ${typeof step}.`,
			);
		}

		// ensure step is bound to parentObject, if possible
		return (...args: unknown[]) => {
			if (parentObject && "apply" in step) {
				return step.apply(parentObject, args);
			}

			return step(...args);
		};
	}
}
