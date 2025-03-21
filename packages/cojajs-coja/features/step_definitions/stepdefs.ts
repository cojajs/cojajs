import * as assert from "node:assert";
import { BeforeAll, Given, Then, When } from "@cucumber/cucumber";
import cojaIndex from "../../src/index.js";

declare global {
	var coja: typeof cojaIndex | undefined;
	var webApp: (() => Promise<unknown>) | undefined;
	var webAppResult: unknown;
}

BeforeAll(() => {
	global.coja = cojaIndex;
});

Given("following code is our bff:", (code: string) => {
	new Function(code)();
});

Given("following code is our runtime:", (code: string) => {
	new Function(code)();
});

Given("following code is our client:", (code: string) => {
	new Function(code)();
});

Given("following code is our webApp:", (code: string) => {
	new Function(code)();
});

When("the webApp is called", async () => {
	global.webAppResult = await global.webApp?.();
});

Then("the webApp should return {int}", (expectedWebAppResult: number) => {
	assert.strictEqual(global.webAppResult, expectedWebAppResult);
});

Then("the webApp should return {string}", (expectedWebAppResult: string) => {
	assert.strictEqual(global.webAppResult, expectedWebAppResult);
});
