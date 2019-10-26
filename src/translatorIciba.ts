import axios from "axios";
import { Iciba } from "./private";
import { PromiseResultType } from "./main";

export type IcibaZHTranslation = {
  word_mean: string;
  has_mean: string;
  split: number;
};

export type IcibaTranslationText = {
  part_name?: string;
  part?: string;
  means: Array<string | IcibaZHTranslation>;
};

type IcibaResult = {
  word_name?: string;
  symbols: Array<{
    parts: Array<IcibaTranslationText>;
    word_symbol?: string;
    net_means?: string;
    exchange?: string;
    ph_en?: string;
    ph_am?: string;
  }>;
};

const translatorIciba = (word: string): Promise<PromiseResultType> => {
  const queryData = {
    w: word,
    key: Iciba.key,
    type: "json"
  };

  return axios
    .get("http://dict-co.iciba.com/api/dictionary.php", {
      params: queryData
    })
    .then(response => {
      const data: IcibaResult = response.data;
      if (data.word_name) {
        return {
          status: "rejected",
          result: {
            query: data.word_name,
            translationResult: data.symbols
          }
        };
      } else {
        return {
          status: "fulfilled",
          result: {
            errorCode: "101",
            errorMSG: "服务器繁忙"
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

export { translatorIciba };
