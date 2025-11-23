
export interface SentenceComponent {
  part: string;
  text: string;
}

export interface Clause {
  type: string;
  text: string;
  explanation: string;
}

export interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
}

export interface AnalysisResult {
  components: SentenceComponent[];
  clauses: Clause[];
  grammarCheck: GrammarError[];
}

export interface HistoryItem {
  id: string;
  sentence: string;
  result: AnalysisResult;
}
