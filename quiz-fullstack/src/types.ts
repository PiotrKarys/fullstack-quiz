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

// Dodaj nowy interfejs dla danych rejestracji
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string; // Dodaj confirmPassword
}

// Dodaj nowy interfejs dla odpowiedzi z backendu po rejestracji
export interface RegisterResponse {
  message: string; // Wiadomość zwracana po rejestracji
  user: User; // Obiekt użytkownika zwracany po rejestracji
}

// Dodaj nowy interfejs dla błędów
export interface ErrorResponse {
  message: string; // Wiadomość błędu
  code?: number; // Opcjonalny kod błędu
}

// Dodaj nowy interfejs dla danych logowania
export interface LoginData {
  email: string;
  password: string;
}

// Dodaj nowy interfejs dla odpowiedzi z backendu po logowaniu
export interface LoginResponse {
  token: string; // Token autoryzacyjny
  user: User; // Obiekt użytkownika zwracany po logowaniu
}
