import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./components/pages/Home";
import Footer from "./components/Footer/Footer";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
// import Quiz from "./components/Quiz/Quiz";

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/quiz" element={<Quiz />} /> */}
        </Routes>
        <Footer />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
