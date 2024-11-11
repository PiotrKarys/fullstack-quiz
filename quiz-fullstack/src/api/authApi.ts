import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "api/auth";

// Funkcja do logowania
export const loginUser = async (loginData: {
  login: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/login`, loginData);
  return response.data; // Zwracamy dane użytkownika
};

// Funkcja do rejestracji
export const registerUser = async (registerData: {
  email: string;
  password: string;
  name: string;
}) => {
  const response = await axios.post(`${API_URL}/register`, registerData);
  return response.data; // Zwracamy dane użytkownika
};

// Funkcja do wylogowania
export const logoutUser = async () => {
  console.log("Wysyłanie żądania wylogowania...");
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    { withCredentials: true }
  );
  console.log("Odpowiedź:", response);
  return response.data; // Zwracamy dane odpowiedzi
};
