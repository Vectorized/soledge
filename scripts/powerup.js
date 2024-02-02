const fs = require("fs");
const path = require("path");

/*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
/*                          CONFIGS                           */
/*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

const LATEST_SOLIDITY_VERSION = "0.8.24";
const SRC_DIR = "src";

/**
 * Powerup: Updates solidity version to `LATEST_SOLIDITY_VERSION`.
 * @param directory The directory containing solidity files.
 */
async function powerup() {
  const updates = [];

  for (let filePath of solidityFiles()) {
    const oldVersion = getSolidityVersion(filePath);
    if (!oldVersion) {
      console.log(`Could not determine Solidity version in ${filePath}`);
      continue;
    }

    if (oldVersion != LATEST_SOLIDITY_VERSION) {
      updates.push({
        file: filePath,
        current: oldVersion,
        latest: LATEST_SOLIDITY_VERSION,
      });
    }
  }

  if (updates.length > 0) {
    console.log(`${updates.length} file(s) are out of date:`);
    console.table(updates);
    const confirmation = await getUserConfirmation();
    if (confirmation) applyUpdates(updates);
  } else {
    console.log(
      "🎉 All your soledge files are on the latest solidity version!"
    );
  }
}

/*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
/*                          Helpers                           */
/*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

function solidityFiles(directory = SRC_DIR, fileList = []) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      solidityFiles(filePath, fileList);
    } else if (file.endsWith(".sol")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

async function getUserConfirmation() {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise((resolve) => {
    rl.question(
      "Do you want to update to the latest version? (y/n): ",
      resolve
    );
  });
  rl.close();
  return answer.toLowerCase() === "y";
}

function applyUpdates(updates) {
  updates.forEach((update) => {
    let content = fs.readFileSync(update.file, "utf-8");
    content = content.replace(new RegExp(update.current, "g"), update.latest);
    fs.writeFileSync(update.file, content, "utf-8");
    console.log(
      `Updated Solidity version in ${update.file} from ${update.current} to ${update.latest}`
    );
  });
  console.log("🎉 Powerup complete!");
}

function getSolidityVersion(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const versionMatch = content.match(/pragma solidity (\^)?(\d+\.\d+\.\d+);/);

  return versionMatch ? versionMatch[2] : null;
}

powerup();
