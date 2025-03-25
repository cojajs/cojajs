import { type Bff, type BffFetcher, Runtime } from "@cojajs/coja";
import type { RequestContextValue } from "./requestContext";

class MyBffFetcher implements BffFetcher {
	private cache = new Map();

	private static bffMap: Record<string, () => Promise<Bff>> = {
		"nextjs-example": () => import("./bff").then((x) => x.default),
	};

	async fetch(bffId: string) {
		if (!this.cache.has(bffId)) {
			const bff = MyBffFetcher.bffMap[bffId]?.();
			if (bff) {
				this.cache.set(bffId, bff);
			}
		}

		return this.cache.get(bffId) ?? null;
	}
}

export const runtime = new Runtime<RequestContextValue>({
	bffFetcher: new MyBffFetcher(),
});
