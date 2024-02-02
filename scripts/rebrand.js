const fs = require("fs");
const {
  getSolidityFiles,
  showUpdates,
  getUserConfirmation,
  applyUpdates,
} = require("./io");

/**
 * Rebrand: Migrate branding from solady to soledge.
 * Currently, only comments are being rebranded.
 */
async function rebrand() {
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

  for (let filePath of getSolidityFiles()) {
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
      "Do you apply these proposed rebranding (all occurances)?"
    );
    if (confirmation) applyUpdates(updates);
  } else {
    console.log(`🎉 All files already adheres to soledge branding guidelines.`);
  }
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

rebrand();
