import {
	type IWorldOptions,
	World,
	setWorldConstructor,
} from "@cucumber/cucumber";

export class CucumberWorld extends World {
	constructor(public readonly options: IWorldOptions<unknown>) {
		super(options);
	}
}

setWorldConstructor(CucumberWorld);
