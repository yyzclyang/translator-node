import md5 = require("md5");
import { BaiduKey } from "./private";
import axios from "axios";
import { PromiseResultType } from "./main";

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

const translatorBaidu = (word: string): Promise<PromiseResultType> => {
  const salt = Math.random();
  const sign = md5(BaiduKey.appId + word + salt + BaiduKey.appSecret);
  const isEnglish = /[a-zA-Z]/.test(word[0]);

  const queryData = {
    q: word,
    appid: BaiduKey.appId,
    salt,
    sign,
    from: isEnglish ? "en" : "zh",
    to: isEnglish ? "zh" : "en"
  };

  return axios
    .get("http://api.fanyi.baidu.com/api/trans/vip/translate", {
      params: queryData
    })
    .then(response => {
      const data: BaiduResult = response.data;
      if (data.error_code) {
        return {
          status: "rejected",
          result: {
            errorCode: data.error_code,
            errorMSG: errorMSG[data.error_code] || "服务器繁忙"
          }
        };
      } else {
        return {
          status: "fulfilled",
          result: {
            query: word,
            translationResult: data.trans_result.map(
              translationText => translationText.dst
            )
          }
        };
      }
    })
    .catch(error => {
      return {
        status: "rejected",
        result: {
          errorMSG: "服务器繁忙"
        }
      };
    });
};

export { translatorBaidu };
