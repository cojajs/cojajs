import child_process from "child_process";
import process from "process";
import { PilotPack } from "./support/PilotPack.mjs";

async function main() {
	const pilotPack = new PilotPack();
	pilotPack.generate();

	const pilotTarballPath = pilotPack.getTarballPath();

	try {
		child_process.execSync(
			`cucumber-js --world-parameters '${JSON.stringify({ pilotTarballPath })}'`,
			{
				cwd: process.cwd(),
				stdio: "inherit",
			},
		);
	} finally {
		pilotPack.drop();
	}
}

main();
