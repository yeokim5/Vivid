import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/NotFound.css";

const NotFound: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="home-link">
          Return to Home
        </Link>
      </div>
    </>
  );
};

export default NotFound; 