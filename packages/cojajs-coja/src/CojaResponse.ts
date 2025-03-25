import type { Json } from "./Json";

export type CojaNetworkResponseType =
	| { data: Json }
	| {
			error: {
				message: string;
			};
	  }
	| Response;

export class CojaResponse {
	public readonly response: CojaNetworkResponseType;

	private constructor(response: CojaNetworkResponseType) {
		this.response = response;
	}

	public static error(error: Error): CojaResponse {
		return new CojaResponse({ error: { message: error.message } });
	}

	public static json(data: Json): CojaResponse {
		return new CojaResponse({ data });
	}

	public static response(response: Response): CojaResponse {
		return new CojaResponse(response);
	}

	public rematchUserSignatureType() {
		if (this.response instanceof Response) {
			return this.response;
		}

		if ("data" in this.response) {
			return this.response.data;
		}

		if ("error" in this.response) {
			throw new Error(this.response.error.message);
		}

		throw new Error("Unknown response type");
	}
}
