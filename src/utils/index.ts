const fetch = require("node-fetch");

class Utils {
  public progressBar = (pro: number) => {
    pro = Math.round(pro * 100);

    let result = "[";

    for (let i = 0; i < pro; i++) {
      if (i % 5 === 0) {
        result += "=";
      }
    }
    result += ">";

    for (let i = 0; i < 100 - pro; i++) {
      if (i % 5 === 0) {
        result += "-";
      }
    }

    result += "]";

    return result;
  };

  public sek2m = (sec: number) => {
    const result = Math.floor(sec / 60) + ":" + (sec % 60 ? sec % 60 : "00");

    return result;
  };
}

export { Utils };
