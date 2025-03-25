import type { Bff, RequestContextTypeOf } from "./Bff";
import type { ClientRuntimeLink } from "./ClientRuntimeLink";
import type { CojaRequest } from "./CojaRequest";
import { CojaResponse } from "./CojaResponse";
import type { Runtime } from "./Runtime";

export class HttpClientRuntimeLink implements ClientRuntimeLink {
	private readonly endpointUrl: string;

	constructor(options: { endpointUrl: string }) {
		this.endpointUrl = options.endpointUrl;
	}

	async execute(request: CojaRequest): Promise<CojaResponse> {
		const fetchResponse = await fetch(this.endpointUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		});

		if (
			fetchResponse.headers.get("Content-Type")?.startsWith("application/json")
		) {
			const responseBody = await fetchResponse.json();

			if ("data" in responseBody) {
				return CojaResponse.json(responseBody.data);
			}

			if ("error" in responseBody) {
				return CojaResponse.error(new Error(responseBody.error.message));
			}
		}

		return CojaResponse.response(fetchResponse);
	}
}
