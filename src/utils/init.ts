import * as fs from "fs";
import Downloader from "nodejs-file-downloader";

const download = async () => {
  const downloaderPBNM = new Downloader({
    url: "https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm",
    directory: "./models/deep",
    fileName: "model.pbmm",
    onProgress: (percentage, _, remaningSize) => {
      console.log("% ", percentage);
      console.log(
        "Remaining bytes: ",
        (remaningSize / 1024 / 1024).toFixed(0),
        "MB"
      );
      if (percentage === "100.00") {
        console.log("Download complete");
      }
    },
    onError: (error) => {
      console.log("Error: ", error);
    },
  });

  const downloaderScorrer = new Downloader({
    url: "https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer",
    directory: "./models/deep",
    fileName: "model.scorer",
    onProgress: (percentage, _, remaningSize) => {
      console.log("% ", percentage);
      console.log(
        "Remaining bytes: ",
        (remaningSize / 1024 / 1024).toFixed(0),
        "MB"
      );
      if (percentage === "100.00") {
        console.log("Download complete");
      }
    },
    onError: (error) => {
      console.log("Error: ", error);
    },
  });

  try {
    if (!fs.existsSync("./models/deep")) {
      await downloaderPBNM.download();
      await downloaderScorrer.download();
    } else if (!fs.existsSync("./models/deep/model.pbmm")) {
      await downloaderPBNM.download();
    } else if (!fs.existsSync("./models/deep/model.scorer")) {
      await downloaderScorrer.download();
    } else {
      console.log("Files already downloaded");
    }
  } catch (error) {
    console.log(error);
  }
};

download();
