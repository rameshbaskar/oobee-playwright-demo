/* eslint-disable */
import { getCurrentPage } from "./driver";
import oobeeA11yInit from "@govtechsg/oobee";
import { TestInfo } from "@playwright/test";
import * as fs from "fs/promises";
import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

declare const runA11yScan: () => Promise<any>;
const execFileAsync = promisify(execFile);

const getOobeeDriver = async (testInfo: TestInfo, zipPath: string) => {
  const project = testInfo.project.use;
  return await oobeeA11yInit({
    entryUrl: project.baseURL,
    testLabel: `${testInfo.title} - Accessibility scan by Oobee`,
    name: "John Doe",
    email: "john.doe@test.com",
    includeScreenshots: true,
    viewportSettings: project.viewport,
    thresholds: {
      mustFix: 0,
      goodToFix: 5,
    },
    scanAboutMetadata: {
      browser: project.defaultBrowserType,
    },
    zip: zipPath,
    deviceChosen: project.isMobile ? "Mobile" : "Desktop",
    ruleset: [
      "enable-wcag-aaa",
    ],
  });
};

const findFirstHtmlFile = async (dir: string): Promise<string | undefined> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFirstHtmlFile(fullPath);
      if (nested) return nested;
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      return fullPath;
    }
  }
  return undefined;
};

const attachDirectOobeeHtmlFromZip = async (testInfo: TestInfo, zipPath: string) => {
  const unzipDir = testInfo.outputPath("oobee-unzipped");
  await fs.mkdir(unzipDir, { recursive: true });

  await execFileAsync("unzip", ["-o", zipPath, "-d", unzipDir]);

  const htmlPath = await findFirstHtmlFile(unzipDir);
  if (!htmlPath) {
    throw new Error(`No HTML report found inside Oobee zip: ${zipPath}`);
  }

  await testInfo.attach("oobee-accessibility-report", {
    path: htmlPath,
    contentType: "text/html",
  });
};

export const scanPageWithOobee = async (testInfo: TestInfo) => {
  const page = getCurrentPage();
  const zipPath = testInfo.outputPath("oobee-scan-results.zip");
  const oobeeDriver = await getOobeeDriver(testInfo, zipPath);
  await page.evaluate(oobeeDriver.getAxeScript());
  await page.evaluate(oobeeDriver.getOobeeFunctions());
  const results = await page.evaluate(
    async () => {
      return await runA11yScan();
    }
  );
  await oobeeDriver.pushScanResults(results, undefined, undefined, page);
  await oobeeDriver.terminate();

  await attachDirectOobeeHtmlFromZip(testInfo, zipPath);
};
