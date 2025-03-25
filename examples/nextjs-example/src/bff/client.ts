import { Client, HttpClientRuntimeLink } from "@cojajs/coja";
import type bff from "./bff";

export const client = Client.create<typeof bff>({
	clientRuntimeLink: new HttpClientRuntimeLink({
		endpointUrl: "/coja",
	}),
	bffId: "nextjs-example",
});
