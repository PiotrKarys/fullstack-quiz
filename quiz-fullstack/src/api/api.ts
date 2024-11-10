const API_URL = import.meta.env.VITE_API_URL + "api/auth"; // Ustal URL do API

// Funkcja do logowania
export const loginUser = async (loginData: {
  login: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message); // Rzucamy błąd, jeśli odpowiedź nie jest ok
  }

  return await response.json(); // Zwracamy dane użytkownika
};

// Funkcja do rejestracji
export const registerUser = async (registerData: {
  email: string;
  password: string;
  name: string;
}) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message); // Rzucamy błąd, jeśli odpowiedź nie jest ok
  }

  return await response.json(); // Zwracamy dane użytkownika
};
