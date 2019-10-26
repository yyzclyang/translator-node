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

export type PromiseResultType = {
  status: string;
  result: {
    errorCode?: string;
    errorMSG?: string;
    query?: string;
    translationResult?: BaiduTranslationResult | IcibaTranslationResult;
  };
};

const isEnglish = (query: string) => {
  return /[a-zA-Z]/.test(query[0]);
};

const logBaiduResult = (query: string, result: BaiduTranslationResult) => {
  console.log(`  ${query}  ~ baidu.com\n`);
  console.log(`  - ${result}`);
};

const logIcibaResult = (query: string, result: IcibaTranslationResult) => {
  console.log(`  ${query}  ~ iciba.com\n`);
  if (isEnglish(query)) {
    result.map(translation => {
      console.log(`  英 [ ${translation.ph_en} ]  美 [ ${translation.ph_am} ]`);
      translation.parts.map(explainTerms => {
        console.log(`  - ${explainTerms.part}  ${explainTerms.means}`);
      });
    });
  } else {
    result.map(translation => {
      console.log(`  拼音 [ ${translation.word_symbol} ]`);
      translation.parts.map(explainTerms => {
        explainTerms.means.map(explain => {
          console.log(`  - ${(explain as IcibaZHTranslation).word_mean}`);
        });
      });
    });
  }
  console.log("\n  ----------  \n");
};

const translator = (word: string) => {
  translatorBaidu(word).then(res => {
    logBaiduResult(word, res.result
      .translationResult as BaiduTranslationResult);
  });
  translatorIciba(word).then(res => {
    logIcibaResult(word, res.result
      .translationResult as IcibaTranslationResult);
  });
};

export { translator };
