import Downloader from "nodejs-file-downloader";

const download = async () => {
  const downloaderEN = new Downloader({
    url: "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip",
    directory: "./models/en",
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
  
  await downloaderEN.download();
  
  try {
    
  } catch (error) {
    console.log(error);
  }
};

download();
