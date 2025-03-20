import type { BffRuntime } from "./BffRuntime";
import type { Client } from "./Client";

export class SsrResponder<RequestContext> {
	constructor(
		private readonly bffRuntime: BffRuntime<RequestContext>,
		private readonly requestContext: RequestContext,
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
