import { runtime } from "@/bff/runtime";
import { CojaRequest } from "@cojajs/coja";

export async function POST(request: Request) {
	const body = await request.json();

	const cojaRequest = new CojaRequest({
		bffId: body.bffId,
		guestPath: body.guestPath,
		rpcPath: body.rpcPath,
		args: body.args,
	});

	const cojaResponse = await runtime.execute(cojaRequest, {
		auth: {
			agentId: "agent-id",
			permissions: ["review_claim"],
		},
	});

	return cojaResponse;
}
