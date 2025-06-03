import React from "react";

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
    <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 700 }}>Name Wheel Spinner</h1>
  </header>
);

export default Header;
