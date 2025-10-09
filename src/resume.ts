import { Octokit } from "@octokit/rest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Plugin } from "rollup";

interface FetchLatestResumeOptions {
	owner: string;
	repo: string;
	releasePath: string;
	outputPath: string;
}

export function fetchLatestResume({
	owner,
	repo,
	releasePath,
	outputPath,
}: FetchLatestResumeOptions): Plugin {
	return {
		name: "fetch-latest-resume",
		async closeBundle() {
			const octokit = new Octokit();
			const { data: release } = await octokit.repos.getLatestRelease({
				owner,
				repo,
			});

			const asset = release.assets.find((a) => a.name === releasePath);
			if (!asset) {
				throw new Error(`Release asset not found: ${releasePath}`);
			}

			console.log(
				`Fetching ${asset.name} from ${owner}/${repo} (${release.tag_name})`,
			);

			const res = await fetch(asset.browser_download_url);
			if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
			if (!res.body) throw new Error(`No response body`);

			const outFile = path.resolve("dist", outputPath);
			await fs.promises.mkdir(path.dirname(outFile), { recursive: true });
			await pipeline(Readable.from(res.body), fs.createWriteStream(outFile));

			console.log(`Saved ${outputPath}`);
		},
	};
}
