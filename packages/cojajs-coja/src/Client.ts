import { EventEmitter } from "node:events";
import { CojaRequest } from "./CojaRequest";

export class Client {
	private static readonly REQUEST_SENT = "REQUEST_SENT";

	#emitter = new EventEmitter();

	constructor(private readonly bffId: string) {}

	get rpc() {
		return createProxy(async (path, args) => {
			const request = new CojaRequest(this.bffId, path, args);
			this.#emitter.emit(Client.REQUEST_SENT, request);
			const response = await request.response;

			if (response.headers.get("Content-Type") === "application/json") {
				return response.json();
			}

			return response;
		});
	}

	subscribeOnRequestSent(listener: (params: CojaRequest) => void): () => void {
		this.#emitter.on(Client.REQUEST_SENT, listener);

		return () => {
			this.#emitter.off(Client.REQUEST_SENT, listener);
		};
	}
}

const createProxy = (
	onApply: (path: string[], args: unknown[]) => unknown,
	path: string[] = [],
) =>
	new Proxy(() => {}, {
		get(_, prop: string) {
			return createProxy(onApply, [...path, prop]);
		},
		apply(_, __, args) {
			return onApply(path, args);
		},
	});
