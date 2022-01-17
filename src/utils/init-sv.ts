import fs from "fs";
import Downloader from "nodejs-file-downloader";
import tar from "tar";

const download = async () => {
  const download = new Downloader({
    url: "https://github.com/mozilla/DeepSpeech/releases/download/v0.4.1/deepspeech-0.4.1-models.tar.gz",
    directory: "./models/swedish",
    onProgress: (percentage, _, remaningSize) => {
      console.log("% ", percentage);
      console.log(
        "Remaining bytes: ",
        (remaningSize / 1024 / 1024).toFixed(0),
        "MB"
      );
      if (percentage === "100.00") {
        console.log("Download complete");
        console.log("Extracting...");
      }
    },
    onError: (error) => {
      console.log("Error: ", error);
    },
  });

  try {
    if (!fs.existsSync("./models/swedish")) {
      await download.download();

      await tar.x({
        file: "./models/swedish/deepspeech-0.4.1-models.tar.gz",
        cwd: "./models/swedish",
      });
      console.log("Extraction complete");
    } else if (!fs.existsSync("./models/swedish/models")) {
      await tar.x({
        file: "./models/swedish/deepspeech-0.4.1-models.tar.gz",
        cwd: "./models/swedish",
        onentry(entry) {
            console.log(entry.path);
        },
        onwarn(message, _) {
            console.warn(message);
        }
      });
      console.log("Extraction complete");
    } else {
      console.log("Files already downloaded");
    }
  } catch (error) {
    console.log(error);
  }
};

download();
