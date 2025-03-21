export const createRpcProxy = (
	onApply: (path: string[], args: unknown[]) => unknown,
	path: string[] = [],
) =>
	new Proxy(() => {}, {
		get(_, prop: string) {
			return createRpcProxy(onApply, [...path, prop]);
		},
		apply(_, __, args) {
			return onApply(path, args);
		},
	});
