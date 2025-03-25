import type { Bff, RequestContextTypeOf } from "./Bff";
import type { ClientRuntimeLink } from "./ClientRuntimeLink";
import type { CojaRequest } from "./CojaRequest";
import { CojaResponse } from "./CojaResponse";
import type { Runtime } from "./Runtime";

export class DirectClientRuntimeLink<BffInstance extends Bff>
	implements ClientRuntimeLink
{
	private readonly runtime: Runtime<RequestContextTypeOf<BffInstance>>;
	private readonly requestContext: RequestContextTypeOf<BffInstance>;

	constructor(options: {
		runtime: Runtime<RequestContextTypeOf<BffInstance>>;
		requestContext: RequestContextTypeOf<BffInstance>;
	}) {
		this.runtime = options.runtime;
		this.requestContext = options.requestContext;
	}

	async execute(request: CojaRequest): Promise<CojaResponse> {
		const response = await this.runtime.execute(request, this.requestContext);

		if (response.headers.get("Content-Type")?.startsWith("application/json")) {
			const responseBody = await response.json();

			if ("data" in responseBody) {
				return CojaResponse.json(responseBody.data);
			}

			if ("error" in responseBody) {
				return CojaResponse.error(new Error(responseBody.error.message));
			}
		}

		return CojaResponse.response(response);
	}
}
