import { RequestContext } from "@cojajs/coja/server";

type ContextType = {
	auth?: {
		agentId: string;
		permissions: string[];
	};
	logForCustomer?: string;
};

export const requestContext = new RequestContext<ContextType>();
