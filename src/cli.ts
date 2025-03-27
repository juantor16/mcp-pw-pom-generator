// src/cli.ts
import { analyzePage } from "./analyzer";
import { generatePOM } from "./pomGenerator";
import { Command } from "commander";

const program = new Command();

program
  .requiredOption("--url <url>", "URL to analyze")
  .option("--output <output>", "Output file name", "GeneratedPage.ts")
  .parse(process.argv);

const options = program.opts();

(async () => {
  const analysis = await analyzePage(options.url);
  console.log("Page analysis result:\n", JSON.stringify(analysis, null, 2));
  generatePOM(analysis.elements, options.output);
})();