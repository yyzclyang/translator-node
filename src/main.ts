import colors = require("colors");
import { translatorBaidu } from "./translatorBaidu";
import {
  IcibaTranslationText,
  IcibaZHTranslation,
  translatorIciba
} from "./translatorIciba";

type BaiduTranslationResult = Array<string>;
type IcibaTranslationResult = Array<{
  parts: Array<IcibaTranslationText>;
  word_symbol?: string;
  net_means?: string;
  exchange?: string;
  ph_en?: string;
  ph_am?: string;
}>;

type PromiseResult = {
  errorCode?: string;
  errorMSG?: string;
  query?: string;
  translationResult?: BaiduTranslationResult | IcibaTranslationResult;
};
export type PromiseResultType = {
  status: string;
  result: PromiseResult;
};

const isEnglish = (query: string) => {
  return /[a-zA-Z]/.test(query[0]);
};

const logBaiduResult = (query: string, promiseResult: PromiseResultType) => {
  console.log(`  ${colors.blue(query)}  ~ baidu.com\n`);
  const result = promiseResult.result;
  if (promiseResult.status === "rejected") {
    return console.log(`  ${colors.red.bold(`${result.errorMSG}`)}`);
  }
  console.log(`  - ${colors.cyan(result.translationResult + "")}`);
};

const logIcibaResult = (query: string, promiseResult: PromiseResultType) => {
  console.log(`  ${colors.blue(query)}  ~ iciba.com\n`);
  const result = promiseResult.result;
  const translationResult = result.translationResult;
  if (promiseResult.status === "rejected") {
    return console.log(`  ${colors.red.bold(`${result.errorMSG}`)}`);
  }
  if (isEnglish(query)) {
    (translationResult as IcibaTranslationResult).map(translation => {
      console.log(
        `  英 ${colors.red(`[ ${translation.ph_en} ]`)}  美 ${colors.red(
          `[ ${translation.ph_am} ]`
        )}`
      );
      translation.parts.map(explainTerms => {
        console.log(
          `  - ${colors.cyan(`${explainTerms.part}  ${explainTerms.means}`)}`
        );
      });
    });
  } else {
    (translationResult as IcibaTranslationResult).map(translation => {
      console.log(`  拼音 ${colors.red(`[ ${translation.word_symbol} ]`)}`);
      translation.parts.map(explainTerms => {
        explainTerms.means.map(explain => {
          console.log(
            `  - ${colors.cyan((explain as IcibaZHTranslation).word_mean)}`
          );
        });
      });
    });
  }
};

const logFailResult = (errorCode: string, errorMSG: string) => {
  console.log(errorMSG);
};

const translator = (word: string) => {
  const logResult = [logBaiduResult, logIcibaResult];

  Promise.all([translatorBaidu(word), translatorIciba(word)]).then(
    translationResponses => {
      translationResponses.map((translationResponse, index) => {
        logResult[index](word, translationResponse);
        console.log("\n  ----------  \n");
      });
    }
  );
};

export { translator };
