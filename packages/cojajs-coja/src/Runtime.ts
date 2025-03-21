import type { BffGetter } from "./BffGetter";
import type { CojaRequest } from "./CojaRequest";
import { requestContextStorage } from "./getRequestContext";

export class Runtime<RequestContext> {
	constructor(private readonly bffGetter: BffGetter) {}

	async execute(
		request: CojaRequest,
		requestContext: RequestContext,
	): Promise<unknown> {
		const bff: unknown = await this.bffGetter.getBff(request.bffId);

		if (bff === null) {
			throw new Error(
				`[bad-request] Bff not found for bffId ${request.bffId}.`,
			);
		}

		if (typeof bff !== "object") {
			throw new Error(
				`[bad-bff] Expected object for bffId ${request.bffId}, but got ${typeof bff}.`,
			);
		}

		if (!("rpc" in bff)) {
			throw new Error(
				`[bad-bff] Expected object with rpc property for bffId ${request.bffId}.`,
			);
		}

		let func = bff.rpc;
		let parentObject = null;
		const pathTaken: string[] = [];

		for (const path of request.path) {
			if (typeof func !== "object") {
				throw new Error(
					`[bad-request] Expected object at path ${pathTaken.join(".")}, but got ${typeof func}.`,
				);
			}

			parentObject = func;
			// @ts-expect-error
			func = func[path];
			pathTaken.push(path);
		}

		if (typeof func !== "function") {
			throw new Error(
				`[bad-request] Expected function at path ${pathTaken.join(".")}, but got ${typeof func}.`,
			);
		}

		return requestContextStorage.run(requestContext, () => {
			if (parentObject && "apply" in func) {
				return func.apply(parentObject, request.args);
			}

			return func(...request.args);
		});
	}
}
