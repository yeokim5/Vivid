import React from "react";
import Navbar from "../components/Navbar";
import "../styles/About.css";

const About: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="about-container">
        <h1>About MagicEssay</h1>
        <div className="about-content">
          <p>
            MagicEssay is a platform that transforms your essays into beautiful, 
            immersive visual experiences. Our AI-powered technology helps you create 
            engaging content that combines thoughtful writing with stunning visuals.
          </p>
          <h2>Our Mission</h2>
          <p>
            We believe that great writing deserves great presentation. Our mission is 
            to help writers create more engaging and memorable content by combining 
            the power of words with visual storytelling.
          </p>
          <h2>Features</h2>
          <ul>
            <li>AI-powered essay enhancement</li>
            <li>Beautiful visual templates</li>
            <li>Custom image selection</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default About; 