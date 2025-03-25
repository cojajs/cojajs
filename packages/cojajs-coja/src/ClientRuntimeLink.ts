import type { CojaRequest } from "./CojaRequest";
import type { CojaResponse } from "./CojaResponse";

export interface ClientRuntimeLink {
	execute(request: CojaRequest): Promise<CojaResponse>;
}
