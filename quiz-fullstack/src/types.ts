export interface User {
  id: string;
  email: string;
  name: string;
  // Dodaj inne pola, które są zwracane przez backend
}

export interface QuizQuestion {
  question: string;
  type: string;
  answers: { text: string; isCorrect: boolean }[];
}
