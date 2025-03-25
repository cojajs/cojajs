import child_process from "child_process";
import fs from "fs";
import path from "path";

export class ScenarioPackage {
	constructor(private scenarioPackageDir: string) {}

	init(pilotTarballPath: string) {
		fs.writeFileSync(
			path.join(this.scenarioPackageDir, "package.json"),
			JSON.stringify(
				{
					name: "my-package",
					version: "1.0.0",
					main: "index.js",
					scripts: {},
					keywords: [],
					author: "",
					license: "ISC",
					packageManager: "pnpm@9.15.4",
					devDependencies: {
						"@cojajs/coja": `file:${pilotTarballPath}`,
						typescript: "5.8.2",
						"@types/node": "22.13.13",
						express: "4.21.2",
						"@types/express": "4.17.21",
						tsx: "4.19.3",
					},
				},
				null,
				2,
			),
		);

		this.exec("pnpm install --prefer-offline");
		this.createTsConfigTs();
	}

	setInPackageJson(key: string, value: string) {
		this.exec(`npm pkg set "${key}"="${value}"`);
	}

	private createTsConfigTs() {
		fs.writeFileSync(
			path.join(this.scenarioPackageDir, "tsconfig.json"),
			JSON.stringify({
				compilerOptions: {
					esModuleInterop: true,
					lib: ["dom", "es2015"],
				},
			}),
		);
	}

	private exec(command: string) {
		child_process.execSync(command, { cwd: this.scenarioPackageDir });
	}
}
