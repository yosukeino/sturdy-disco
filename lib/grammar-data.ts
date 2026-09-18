import jsonData from './1-20.json';

export interface GrammarSentence {
  en: string;
  jp: string;
}

export interface GrammarSection {
  title: string;
  sentences: GrammarSentence[];
}

export type GrammarData = Record<number, GrammarSection>;

const grammarData: GrammarData = Object.keys(jsonData).reduce(
  (acc, key) => {
    const numKey = Number(key);
    const section = (jsonData as Record<string, GrammarSection>)[key];
    acc[numKey] = section;
    return acc;
  },
  {} as GrammarData
);

export { grammarData };

export const TOTAL_SECTIONS = Object.keys(grammarData).length;
