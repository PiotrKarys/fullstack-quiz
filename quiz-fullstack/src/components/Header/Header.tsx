import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Logout from "../Auth/Logout";

const Header: React.FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {!isLoggedIn && (
            <>
              <li>
                <Link to="/login">Logowanie</Link>
              </li>
              <li>
                <Link to="/register">Rejestracja</Link>
              </li>
            </>
          )}
          <li>
            <Link to="/contact">Kontakt</Link>
          </li>
          {isLoggedIn && (
            <>
              <li>
                <Link to="/quiz">Quiz</Link>
              </li>
              <li>
                <Logout />
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
