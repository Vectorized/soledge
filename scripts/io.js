const fs = require("fs");
const path = require("path");
const { SRC_DIR } = require("./config");
/*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/
/*                         I/O Helpers                        */
/*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/

/**
 * Recursively retrieves a list of Solidity files within a given directory.
 *
 * @param {string} directory - The root directory to search for Solidity files. Defaults to SRC_DIR.
 * @param {string[]} fileList - An optional array to accumulate file paths (used for recursion).
 * @returns {string[]} An array of Solidity file paths.
 */
function getSolidityFiles(directory = SRC_DIR, fileList = []) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      getSolidityFiles(filePath, fileList);
    } else if (file.endsWith(".sol")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Shows the updates to be applied as a table.
 *
 * @param {Update[]} updates - An array of update objects containing scope, file paths, pattern, and patch.
 */
async function showUpdates(updates) {
  console.log(`${updates.length} update(s) can be automatically applied:`);

  // Friendly table heading.
  updates = updates.map((update) => ({
    "Update type": update.scope,
    File: update.file,
    "Current value": truncate(update.from),
    "Proposed change": truncate(update.to),
  }));

  // Increasing index so it starts from 1 instead of 0.
  updates = updates.reduce((acc, u, i) => {
    acc[i + 1] = u;
    return acc;
  }, {});

  console.table(updates);
}

/**
 * Prompts the user for confirmation with a yes/no question.
 *
 * @param {string} prompt - The question to ask the user.
 * @returns {Promise<boolean>} A Promise that resolves to true if the user confirms, false otherwise.
 */
async function getUserConfirmation(prompt) {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise((resolve) => {
    rl.question(`${prompt} (y/n): `, resolve);
  });
  rl.close();
  return answer.toLowerCase() === "y";
}

/**
 * Applies updates to specified files.
 *
 * @param {Update[]} updates - An array of update objects containing scope, file paths, pattern, and patch.
 */
function applyUpdates(updates) {
  updates.forEach((update) => {
    let content = fs.readFileSync(update.file, "utf-8");
    // The update query may contain reserved regex characters
    // that needs to be escaped to be considered literally.
    let inputString = update.from.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    content = content.replace(new RegExp(inputString, "g"), update.to);
    fs.writeFileSync(update.file, content, "utf-8");
  });
  console.log(
    `🎉 ${updates.length} update(s) applied.\n👀 Please verify before committing to git.`
  );
}
/**
 * Adds ellipis to text beyond a defined length.
 *
 * @param {string} Text the text to truncate.
 * @returns {string} The truncated text.
 */
function truncate(text) {
  let length = 30;
  if (text.length <= length) return text;
  return text.substr(0, 30) + "\u2026";
}

module.exports = {
  getSolidityFiles,
  showUpdates,
  getUserConfirmation,
  applyUpdates,
};
