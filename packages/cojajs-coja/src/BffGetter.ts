type AnyUserBff = unknown;

export interface BffGetter {
	getBff(bffId: string): Promise<AnyUserBff | null>;
}
