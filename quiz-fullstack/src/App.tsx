import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<div>Logowanie</div>} />
          <Route path="/register" element={<div>Rejestracja</div>} />
          <Route path="/quiz" element={<div>Quiz</div>} />
          <Route path="/contact" element={<div>Kontakt</div>} />
        </Routes>
        <Footer />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
