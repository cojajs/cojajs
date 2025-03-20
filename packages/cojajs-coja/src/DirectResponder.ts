import type { BffRuntime } from "./BffRuntime";
import type { Client } from "./Client";
import type { Responder } from "./Responder";

export class DirectResponder implements Responder {
	constructor(
		private readonly bffRuntime: BffRuntime,
		private readonly requestContext: unknown,
	) {}

	serve(client: Client): () => void {
		const unsubscribe = client.subscribeOnRequestSent(async (request) => {
			const bffReturn = await this.bffRuntime.executeBffFunction(
				request,
				this.requestContext,
			);

			const response = new Response(JSON.stringify(bffReturn), {
				headers: {
					"Content-Type": "application/json",
				},
				status: 200,
			});

			request.respond(response);
		});

		return unsubscribe;
	}
}
