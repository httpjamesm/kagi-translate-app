import { exec } from "child_process";
import process from "process";
import path from "path";
import fs from "fs";
// check directory
const currentDir = process.cwd();
if (!currentDir.endsWith("scripts")) {
  console.error("Please run this script from the scripts directory");
  process.exit(1);
}

console.log("Building for iOS...");

const options = {
  cwd: path.resolve(__dirname, "../src-tauri"),
};

exec(
  "bun tauri ios build --export-method app-store-connect",
  options,
  (error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    console.log("Uploading to App Store Connect...");

    //   read .iosbuildopts.json
    const iosBuildOptsJson = JSON.parse(
      fs.readFileSync(path.resolve(currentDir, ".iosbuildopts.json"), "utf8")
    );

    const appStoreConnectApiKey = iosBuildOptsJson["appStoreConnectApiKey"];
    const appStoreConnectIssuerId = iosBuildOptsJson["appStoreConnectIssuerId"];

    exec(
      `xcrun altool --upload-app --type ios --file "${options.cwd}/gen/apple/build/arm64/Kagi Translate.ipa" --apiKey ${appStoreConnectApiKey} --apiIssuer ${appStoreConnectIssuerId}`,
      options,
      (error) => {
        if (error) {
          console.error(error);
          process.exit(1);
        }

        console.log("Uploaded to App Store Connect");
      }
    );
  }
);
