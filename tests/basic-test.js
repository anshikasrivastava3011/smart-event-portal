const fs = require("fs");
const path = require("path");

const requiredFiles = [
    "server.js",
    "public/index.html",
    "public/style.css",
    "public/script.js"
];

let testFailed = false;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, "..", file);

    if (fs.existsSync(filePath)) {
        console.log(`PASS: ${file} exists`);
    } else {
        console.error(`FAIL: ${file} is missing`);
        testFailed = true;
    }
});

if (testFailed) {
    console.error("Basic tests failed.");
    process.exit(1);
}

console.log("All basic tests passed.");
process.exit(0);