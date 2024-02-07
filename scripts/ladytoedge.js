const fs = require("fs");
const path = require("path");

/* Configurations */
let LATEST_SOLIDITY_VERSION = "0.8.24";
const SRC_DIR = "src";

/* I/O Helpers */
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

function showUpdates(updates) {
    console.log(`${updates.length} update(s) can be automatically applied:`);
    console.table(updates);
}

function getUserConfirmation(prompt) {
    const rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(`${prompt} (y/n): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === "y");
        });
    });
}

function applyUpdates(updates) {
    updates.forEach((update) => {
        let content = fs.readFileSync(update.file, "utf-8");
        let inputString = update.from.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        content = content.replace(new RegExp(inputString, "g"), update.to);
        fs.writeFileSync(update.file, content, "utf-8");
    });
    console.log(
        `🎉 ${updates.length} update(s) applied.\n👀 Please verify before committing to git.`
    );
}

function getSolidityVersion(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const versionMatch = content.match(/pragma solidity (\^)?(\d+\.\d+\.\d+);/);
    return versionMatch ? versionMatch[2] : null;
}

// migrating solidity version
async function powerup(fileOrDir = SRC_DIR, subCommand, version) {
    if (subCommand === "--solc") {
        updateSolcVersion(version);
    }
    const updates = [];
    let solidityFiles = [];

    if (fs.lstatSync(fileOrDir).isDirectory()) {
        solidityFiles = getSolidityFiles(fileOrDir);
    }
    else {
        if (fileOrDir.endsWith(".sol")) {
            solidityFiles.push(fileOrDir);
        } else {
            console.error("Please provide a valid Solidity file or directory.");
            return;
        }
    }


    for (const filePath of solidityFiles) {
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
            "Do you want to upgrade these file(s) to the latest Solidity version?"
        );
        if (confirmation) applyUpdates(updates);
    } else {
        console.log(
            `🎉 All files are already on the latest Solidity version (${LATEST_SOLIDITY_VERSION})!`
        );
    }
}

// migrating solady brand to soledge
async function rebrand(fileOrDir = SRC_DIR) {
    const updates = [];
    const COMMENT_MAPPING = [
        {
            from: "/*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/",
            to: "/*«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-«-*/",
        },
        {
            from: "/*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/",
            to: "/*-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»-»*/",
        },
    ];


    let solidityFiles = [];

    if (fs.lstatSync(fileOrDir).isDirectory()) {
        solidityFiles = getSolidityFiles(fileOrDir);
    } else {
        if (fileOrDir.endsWith(".sol")) {
            solidityFiles.push(fileOrDir);
        } else {
            console.error("Please provide a valid Solidity file or directory.");
            return;
        }
    }

    if (solidityFiles.length === 0) {
        console.error("No Solidity files found in the specified directory.");
        return;
    }

    for (let filePath of solidityFiles) {
        for (let patch of COMMENT_MAPPING) {
            if (fileContainsPattern(filePath, patch.from)) {
                updates.push({
                    scope: "soledge branding",
                    file: filePath,
                    from: patch.from,
                    to: patch.to,
                });
            }
        }
    }

    if (updates.length > 0) {
        showUpdates(updates);
        const confirmation = await getUserConfirmation(
            "Confirm applying the proposed branding updates?"
        );
        if (confirmation) applyUpdates(updates);
    } else {
        console.log(
            `🎉 All files already adhere to soledge branding guidelines.`
        );
    }

    function fileContainsPattern(filePath, pattern) {
        const content = fs.readFileSync(filePath, "utf-8");
      
        // Escape regex special characters from pattern
        pattern = pattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      
        // Use the escaped pattern in the regex match
        const regex = new RegExp(pattern);
      
        // Check if the content matches the pattern
        return regex.test(content);
      }
      
}

function updateSolcVersion(version) {
    LATEST_SOLIDITY_VERSION = version;
}

const args = process.argv.slice(2);
const command = args[0];
const fileOrDir = args[1];
const subCommand = args[2];
const version = args[3];

if (command === "--powerup") {
    powerup(fileOrDir, subCommand, version);
}
else if (command === "--rebrand") {
    rebrand(fileOrDir);
}
else {
    console.error("Invalid command.\n");
    console.log("Usage: node ladytoedge.js <command> <filename|folderpath>");
    console.log("Available commands:");
    console.log("--rebrand <filename|folderpath>");
    console.log("--powerup <filename|folderpath> --solc <solidity version>");
    process.exit(1);

}
