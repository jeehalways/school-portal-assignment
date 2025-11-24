const fs = require("fs");
const path = require("path");

const testDB = path.join(__dirname, "test.sqlite");

// Remove test DB before each test run
if (fs.existsSync(testDB)) {
  fs.unlinkSync(testDB);
  console.log("Removed old test.sqlite");
}
