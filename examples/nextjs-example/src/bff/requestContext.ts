import { RequestContext } from "@cojajs/coja/server";

export type RequestContextValue = {
	auth?: {
		agentId: string;
		permissions: string[];
	};
	logForCustomer?: string;
};

export const requestContext = new RequestContext<RequestContextValue>();
