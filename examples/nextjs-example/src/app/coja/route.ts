import { runtime } from "@/bff/runtime";
// import { Readable } from "node:stream";
// import express, {
// 	type Request,
// 	type Response as ExpressResponse,
// } from "express";
import { CojaRequest } from "@cojajs/coja";

// app.post(
// 	"/coja",
// 	express.json(),
// 	async (req: Request, expressRes: ExpressResponse) => {
// 		const body = req.body;

// 		const cojaRequest = new CojaRequest({
// 			bffId: body.bffId,
// 			guestPath: body.guestPath,
// 			rpcPath: body.rpcPath,
// 			args: body.args,
// 		});

// 		const cojaResponse = await runtime.execute(cojaRequest, {
// 			username: "janesmith",
// 		});

// 		if (cojaResponse instanceof Response) {
// 			expressRes.status(cojaResponse.status);

// 			cojaResponse.headers.forEach((value, key) => {
// 				expressRes.setHeader(key, value);
// 			});

// 			if (cojaResponse.body) {
// 				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
// 				const nodeStream = Readable.fromWeb(cojaResponse.body as any);
// 				nodeStream.pipe(expressRes);
// 			} else {
// 				expressRes.end();
// 			}
// 			return;
// 		}

// 		expressRes.json(cojaResponse);
// 	},
// );

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
			permissions: ["review_claim"],
		},
	});

	return cojaResponse;
}
