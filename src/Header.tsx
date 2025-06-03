import React from "react";

// Centralized app title for use in both header and document title
export const APP_TITLE = "Tres Comas Lucky Draw Wheel - Spin to Win!";

const Header: React.FC = () => (
  <header style={{
    width: "100%",
    background: "#646cff",
    color: "#fff",
    padding: "1.5rem 0 1rem 0",
    textAlign: "center",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px #0001"
  }}>
    <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 700 }}>{APP_TITLE}</h1>
  </header>
);

export default Header;
