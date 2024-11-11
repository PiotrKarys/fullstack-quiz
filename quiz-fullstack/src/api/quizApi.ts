import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "api/quiz"; // Ustal URL do API

// Funkcja do pobierania typów pytań
export const getQuestionTypes = async () => {
  const response = await axios.get(`${API_URL}/types`);
  return response.data; // Zwracamy typy pytań
};

// Możesz dodać inne funkcje związane z quizem, np. pobieranie pytań według typu
export const getQuestionsByType = async (type: string) => {
  const response = await axios.get(`${API_URL}/types/${type}`);
  return response.data; // Zwracamy pytania według typu
};
