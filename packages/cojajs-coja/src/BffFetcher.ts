type AnyUserBff = unknown;

export interface BffFetcher {
	fetch(bffId: string): Promise<AnyUserBff | null>;
}
