import { useRequestContext } from "./requestContext";

export abstract class Controller {
	protected useRequestContext() {
		const value = useRequestContext();

		if (!value) {
			throw new Error("No request context found");
		}

		return value;
	}

	static Auth({ permission }: { permission: string }) {
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		return (value: Function, _context: ClassMethodDecoratorContext) => {
			function authMiddleware(this: Controller, ...args: unknown[]) {
				const { auth } = this.useRequestContext();
				if (!auth?.permissions.includes(permission)) {
					throw new Error(`Unauthorized, missing permission: "${permission}"`);
				}

				return value.apply(this, args);
			}

			return authMiddleware;
		};
	}

	static Docs(description: string) {
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		return (_value: Function, context: ClassMethodDecoratorContext) => {
			context.metadata.description = description;
		};
	}
}
