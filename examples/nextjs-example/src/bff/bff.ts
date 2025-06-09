import { Bff } from "@cojajs/coja";
import { Claims } from "./controllers/Claims";
import { requestContext } from "./requestContext";

export const bff = new Bff({
	rpc: {
		claims: new Claims(),
	},
	requestContext,
});
