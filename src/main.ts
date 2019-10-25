import * as https from "https";
import * as querystring from "querystring";
import sha256 = require("sha256");
import { appKey, key } from "./private";

type YouDaoResult = {
  errorCode: string;
  query: string;
  translation: Array<string>;
  basic?: Object;
  web?: Array<{
    key: string;
    value: Array<string>;
  }>;
  l: string;
  dict?: { url: string };
  webdict?: { url: string };
  tSpeakUrl?: string;
  speakUrl?: string;
  returnPhrase?: Array<string>;
};

const errorMSG = {
  "101": "缺少必填的参数",
  "102": "不支持的语言类型",
  "103": "翻译文本过长",
  "104": "不支持的API类型",
  "105": "不支持的签名类型",
  "106": "不支持的响应类型",
  "107": "不支持的传输加密类型",
  "108":
    "应用ID无效，注册账号，登录后台创建应用和实例并完成绑定，可获得应用ID和应用密钥等信息",
  "109": "batchLog格式不正确",
  "110": "无相关服务的有效实例",
  "111": "开发者账号无效",
  "113": "q不能为空",
  "114": "不支持的图片传输方式",
  "201": "解密失败，可能为DES,BASE64,URLDecode的错误",
  "202": "签名检验失败",
  "203": "访问IP地址不在可访问IP列表",
  "205": "请求的接口与应用的平台类型不一致，如有疑问请参考入门指南",
  "206": "因为时间戳无效导致签名校验失败",
  "207": "重放请求",
  "301": "辞典查询失败",
  "302": "翻译查询失败",
  "303": "服务端的其它异常",
  "304": "会话闲置太久超时",
  "401": "账户已经欠费停",
  "402": "offlinesdk不可用",
  "411": "访问频率受限,请稍后访问",
  "412": "长请求过于频繁，请稍后访问",
  "1001": "无效的OCR类型",
  "1002": "不支持的OCR image类型",
  "1003": "不支持的OCR Language类型",
  "1004": "识别图片过大",
  "1201": "图片base64解密失败",
  "1301": "OCR段落识别失败",
  "1411": "访问频率受限",
  "1412": "超过最大识别字节数",
  "2003": "不支持的语音声道",
  "2004": "不支持的语音上传类型",
  "2005": "不支持的语言类型",
  "2006": "不支持的识别类型",
  "2201": "识别音频文件过大",
  "2301": "识别音频时长过长",
  "2411": "不支持的音频文件类型",
  "2412": "不支持的发音类型",
  "3001": "不支持的语音格式",
  "3002": "不支持的语音采样率",
  "3003": "不支持的语音声道",
  "3004": "不支持的语音上传类型",
  "3005": "不支持的语言类型",
  "3006": "不支持的识别类型",
  "3007": "识别音频文件过大",
  "3008": "识别音频时长过长",
  "3009": "不支持的音频文件类型",
  "3010": "不支持的发音类型",
  "3201": "解密失败",
  "3301": "语音识别失败",
  "3302": "语音翻译失败",
  "3303": "服务的异常",
  "3411": "访问频率受限,请稍后访问",
  "3412": "超过最大请求字符数",
  "5001": "无效的OCR类型",
  "5002": "不支持的OCR image类型",
  "5003": "不支持的语言类型",
  "5004": "识别图片过大",
  "5005": "不支持的图片类型",
  "5006": "文件为空",
  "5201": "解密错误，图片base64解密失败",
  "5301": "OCR段落识别失败",
  "5411": "访问频率受限",
  "5412": "超过最大识别流量",
  "9001": "不支持的语音格式",
  "9002": "不支持的语音采样率",
  "9003": "不支持的语音声道",
  "9004": "不支持的语音上传类型",
  "9005": "不支持的语音识别 Language类型",
  "9301": "ASR识别失败",
  "9303": "服务器内部错误",
  "9411": "访问频率受限（超过最大调用次数）",
  "9412": "超过最大处理语音长度",
  "10001": "无效的OCR类型",
  "10002": "不支持的OCR image类型",
  "10004": "识别图片过大",
  "10201": "图片base64解密失败",
  "10301": "OCR段落识别失败",
  "10411": "访问频率受限",
  "10412": "超过最大识别流量",
  "13001": "不支持的角度类型",
  "13002": "不支持的文件类型",
  "13003": "表格识别图片过大",
  "13004": "文件为空",
  "13301": "表格识别失败",
  "17001": "需要图片",
  "17002": "图片过大（1M）",
  "17003": "识别类型未找到",
  "17004": "不支持的识别类型",
  "17005": "服务调用失败",
  "-1000": "未知错误",
  "-2000": "查询输入为空"
};

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

  const request = https.request(options, response => {
    const chunks = [];
    response.on("data", chunk => {
      chunks.push(chunk);
    });

    response.on("end", () => {
      const responseData: YouDaoResult = JSON.parse(
        Buffer.concat(chunks).toString()
      );
      if (responseData.errorCode === "0") {
        console.log(responseData.web[0].value);
      } else {
        console.log("errorCode", errorMSG[responseData.errorCode]);
        process.exit(1);
      }
    });
  });

  request.write(requestBody);

  request.on("error", e => {
    console.error(e);
  });
  request.end();
};

export { translate };
