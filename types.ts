export interface GreetingResponse {
  title: string;
  lines: string[];
  luckyWord: string;
}

export enum AppState {
  CLOSED = 'CLOSED',
  OPENING = 'OPENING',
  OPENED = 'OPENED'
}
