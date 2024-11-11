import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/userSlice"; // Importuj akcję wylogowania
import { logoutUser } from "../../api/authApi"; // Importuj funkcję wylogowania
import { RootState } from "../../store/store"; // Importuj RootState

const Logout: React.FC = () => {
  const dispatch = useDispatch(); // Hook do uzyskania dostępu do dispatch
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn); // Sprawdź, czy użytkownik jest zalogowany

  const handleLogout = async () => {
    if (!isLoggedIn) {
      console.error("Użytkownik nie jest zalogowany.");
      return; // Zatrzymaj, jeśli użytkownik nie jest zalogowany
    }

    try {
      await logoutUser(); // Wywołaj funkcję API do wylogowania
      dispatch(logout()); // Wywołaj akcję wylogowania w Reduxie
      console.log("Użytkownik został wylogowany."); // Loguj informację o wylogowaniu
    } catch (error) {
      console.error("Błąd podczas wylogowania:", error);
    }
  };

  return <button onClick={handleLogout}>Wyloguj się</button>;
};

export default Logout;
