// components/Navbar.js
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const navStyles = {
    padding: "20px",
    height: "100vh",
    position: "sticky",
    top: 0,
    overflowY: "auto",
  };

  const linkStyles = {
    display: "block",
    padding: "10px 15px",
    margin: "5px 0",
    textDecoration: "none",
    color: "#333",
    borderRadius: "5px",
    transition: "background-color 0.3s",
  };

  const activeLinkStyles = {
    ...linkStyles,
    backgroundColor: "#3498db",
    color: "white",
  };

  const menuItems = [
    { path: "/fixtures", label: "Fikstürler"},
    { path: "/leagues", label: "Ligler" },
    { path: "/clubs", label: "Takımlar" },
    { path: "/nations", label: "Ülkeler" },
  ];

  return (
    <nav style={navStyles}>
      <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>MAÇPEŞİNDE</h2>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={location.pathname === item.path ? activeLinkStyles : linkStyles}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}