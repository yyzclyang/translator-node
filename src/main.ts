import * as https from "https";
import * as querystring from "querystring";
import { appId, appSecret } from "./private";
import md5 = require("md5");

const errorMSG: { [key: string]: string } = {
  "52000": "成功",
  "52001": "请求超时",
  "52002": "系统错误",
  "52003": "未授权用户",
  "54000": "必填参数为空",
  "54001": "签名错误",
  "54003": "访问频率受限",
  "54004": "账户余额不足",
  "54005": "长query请求频繁",
  "58000": "客户端IP非法",
  "58001": "译文语言方向不支持",
  "58002": "服务当前已关闭",
  "90107": "认证未通过或未生效"
};

type TranslationResult = {
  src: string;
  dst: string;
};

type BaiduResult = {
  error_code?: string;
  error_msg?: string;
  from: string;
  to: string;
  trans_result: Array<TranslationResult>;
};

const translate = (word: string) => {
  const salt = Math.random();
  const sign = md5(appId + word + salt + appSecret);
  const isEnglish = /[a-zA-Z]/.test(word[0]);

  const query = querystring.stringify({
    q: word,
    appid: appId,
    salt,
    sign,
    from: isEnglish ? "en" : "zh",
    to: isEnglish ? "zh" : "en"
  });

  const options = {
    hostname: "api.fanyi.baidu.com",
    port: 443,
    path: "/api/trans/vip/translate?" + query,
    mthod: "GET"
  };

  const request = https.request(options, response => {
    const chunks: Array<Buffer> = [];
    response.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    response.on("end", () => {
      const responseData: BaiduResult = JSON.parse(
        Buffer.concat(chunks).toString()
      );

      if (responseData.error_code) {
        console.error(errorMSG[responseData.error_code] || "服务器繁忙");
        process.exit(1);
      } else {
        responseData.trans_result.map(translationResult => {
          console.log(translationResult.dst);
        });
        process.exit(0);
      }
    });
  });

  request.on("error", e => {
    console.error(e);
  });
  request.end();
};

export { translate };
