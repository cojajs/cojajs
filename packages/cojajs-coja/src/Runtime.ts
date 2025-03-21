import type { Bff } from "./Bff";
import type { BffGetter } from "./BffGetter";
import type { CojaRequest } from "./CojaRequest";
import { requestContextStorage } from "./getRequestContext";

export class Runtime<RequestContext> {
	constructor(private readonly bffGetter: BffGetter) {}

	async execute(
		request: CojaRequest,
		requestContext: RequestContext,
	): Promise<unknown> {
		let bff = await this.bffGetter.getBff(request.bffId);
		this.assertBff(request.bffId, bff);

		bff = this.resolveGuestPath(bff, request.guestPath);
		this.assertBff(this.stringifyGuestPath(request), bff);

		const bffFunction = this.getBffFunction(bff, request);

		return requestContextStorage.run(requestContext, () => {
			return bffFunction(...request.args);
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
