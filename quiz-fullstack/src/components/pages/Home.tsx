import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <main>
      <h1>Witaj w naszej aplikacji!</h1>
      <p>To jest wstępny opis o stronie.</p>
      <Link to="/quiz">
        <button>Get Started</button>
      </Link>
    </main>
  );
};

export default Home;
