import React, { useState } from "react";
import { registerUser } from "../../api/api"; // Importuj funkcję rejestracji

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Resetuj błąd
    setSuccessMessage(null); // Resetuj komunikat sukcesu

    // Walidacja hasła
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są takie same");
      return;
    }

    try {
      // Przesyłamy dane w odpowiednim formacie
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setSuccessMessage(response.message); // Ustaw komunikat sukcesu
      console.log("Użytkownik:", response.user); // Logowanie danych użytkownika
    } catch (error: any) {
      setError(error.message); // Ustaw błąd
    }
  };

  return (
    <div>
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Imię i nazwisko"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Potwierdź hasło"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Zarejestruj się</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}{" "}
      {/* Wyświetlanie błędów */}
      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}{" "}
      {/* Wyświetlanie komunikatu sukcesu */}
    </div>
  );
};

export default Register;
