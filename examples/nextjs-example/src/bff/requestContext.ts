import { RequestContext } from "@cojajs/coja";

export type RequestContextValue = {
	auth?: {
		agentId: string;
		permissions: string[];
	};
	logForCustomer?: string;
};

export const requestContext = new RequestContext<RequestContextValue>();
export const useRequestContext = () => requestContext.use();
