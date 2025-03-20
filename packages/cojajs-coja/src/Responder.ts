import type { Client } from "./Client";

export interface Responder {
	serve(client: Client): () => void;
}
