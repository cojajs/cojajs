import { Bff } from "@cojajs/coja";
import { Claims } from "./controllers/Claims";
import { requestContext } from "./requestContext";

export default new Bff({
	rpc: {
		claims: new Claims(),
	},
	requestContext,
});
