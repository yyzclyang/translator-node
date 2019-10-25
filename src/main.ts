import * as https from "https";
import * as querystring from "querystring";
import sha256 = require("sha256");
import { appKey, key } from "./private";

const truncate = word => {
  const length = word.length;
  if (length <= 20) return word;
  return word.substring(0, 10) + length + word.substring(length - 10, length);
};

const translate = (word: string) => {
  const salt = new Date().getTime();
  const curTime = Math.round(new Date().getTime() / 1000);
  const sign = sha256(appKey + truncate(word) + salt + curTime + key);
  const bodyData = {
    q: word,
    from: "zh",
    to: "en",
    appKey: appKey,
    salt: salt,
    sign: sign,
    signType: "v3",
    curtime: curTime
  };
  const requestBody = querystring.stringify(bodyData);

  const options = {
    hostname: "openapi.youdao.com",
    port: 443,
    path: "/api",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "Content-Length": requestBody.length
    }
  };

  const request = https.request(options, res => {
    console.log("状态码:", res.statusCode);
    console.log("请求头:", res.headers);

    res.on("data", d => {
      process.stdout.write(d);
    });
  });

  request.write(requestBody);

  request.on("error", e => {
    console.error(e);
  });
  request.end();
};

export { translate };
