import { loadConfiguration, runCucumber } from "@cucumber/cucumber/api";

async function main() {
	try {
		console.time("cucumber:loadConfiguration");
		const { runConfiguration } = await loadConfiguration({
			provided: {
				worldParameters: {},
			},
		});
		console.timeEnd("cucumber:loadConfiguration");

		console.time("cucumber:runCucumber");
		const { success } = await runCucumber(runConfiguration);
		console.timeEnd("cucumber:runCucumber");

		console.log(success);
	} finally {
	}
}

main();
