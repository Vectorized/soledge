const fs = require("fs");
const { LATEST_SOLIDITY_VERSION } = require("./config");
const {
  getSolidityFiles,
  showUpdates,
  getUserConfirmation,
  applyUpdates,
} = require("./io");

/**
 * Powerup: Updates solidity version to `LATEST_SOLIDITY_VERSION`.
 */
async function powerup() {
  const updates = [];

  for (let filePath of getSolidityFiles()) {
    const oldVersion = getSolidityVersion(filePath);
    if (!oldVersion) {
      console.log(`Could not determine Solidity version in ${filePath}`);
      continue;
    }

    if (oldVersion != LATEST_SOLIDITY_VERSION) {
      updates.push({
        scope: "Solidity version",
        file: filePath,
        from: oldVersion,
        to: LATEST_SOLIDITY_VERSION,
      });
    }
  }

  if (updates.length > 0) {
    showUpdates(updates);
    const confirmation = await getUserConfirmation(
      "Do you want to upgrade these file(s) to the latest version?"
    );
    if (confirmation) applyUpdates(updates);
  } else {
    console.log(
      `🎉 soledge is on the latest Solidity version (${LATEST_SOLIDITY_VERSION})!`
    );
  }
}

function getSolidityVersion(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const versionMatch = content.match(/pragma solidity (\^)?(\d+\.\d+\.\d+);/);

  return versionMatch ? versionMatch[2] : null;
}

powerup();
