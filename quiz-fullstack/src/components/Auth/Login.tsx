import React, { useState } from "react";
import { loginUser } from "../../api/api"; // Importujemy funkcję logowania

const Login: React.FC = () => {
  const [login, setLogin] = useState<string>(""); // Używamy login jako email lub name
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Resetujemy błąd

    try {
      // Przesyłamy dane w odpowiednim formacie
      const data = await loginUser({ login, password }); // Używamy funkcji API
      // Zapisz tokeny w localStorage lub sessionStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      console.log("Zalogowany użytkownik:", data.userData); // Logowanie danych użytkownika
      // Przekierowanie lub aktualizacja stanu aplikacji
      // np. history.push("/dashboard");
    } catch (err) {
      setError(err.message); // Ustawiamy błąd do wyświetlenia
    }
  };

  return (
    <div>
      <h2>Logowanie</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}{" "}
      {/* Wyświetlamy błąd */}
      <form onSubmit={handleLogin}>
        <div>
          <label>Login (Email lub Nazwa):</label>
          <input
            type="text"
            value={login}
            onChange={e => setLogin(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zaloguj się</button>
      </form>
    </div>
  );
};

export default Login;
