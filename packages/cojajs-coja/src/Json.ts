export type Json = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
	[key: string]: Json;
}

type JsonArray = Json[];
