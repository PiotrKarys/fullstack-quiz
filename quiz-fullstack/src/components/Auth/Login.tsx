import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/userSlice"; // Importuj akcję logowania
import { loginUser } from "../../api/authApi"; // Importujemy funkcję logowania

const Login: React.FC = () => {
  const [loginInput, setLogin] = useState<string>(""); // Używamy login jako email lub name
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const dispatch = useDispatch(); // Hook do uzyskania dostępu do dispatch

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Resetujemy błąd

    try {
      // Przesyłamy dane w odpowiednim formacie
      const data = await loginUser({ login: loginInput, password }); // Używamy funkcji API

      // Zapisz tokeny w cookies
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      document.cookie = `refreshToken=${data.refreshToken}; path=/;`;

      // Dispatchuj akcję logowania
      dispatch(
        login({ user: { email: data.userData.email, id: data.userData.id } })
      );

      // Przekierowanie lub aktualizacja stanu aplikacji
      // np. history.push("/dashboard");
    } catch (err) {
      // Sprawdź, czy err jest typu Error
      if (err instanceof Error) {
        setError(err.message); // Ustawiamy błąd do wyświetlenia
      } else {
        setError("Wystąpił nieznany błąd."); // Obsługuje przypadki, gdy err nie jest instancją Error
      }
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
            value={loginInput}
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
