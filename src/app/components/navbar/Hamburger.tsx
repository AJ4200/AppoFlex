import React from "react";

interface HamburgerProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const Hamburger: React.FC<HamburgerProps> = ({ isMenuOpen, toggleMenu }) => {
  return (
    <div
      className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
      onClick={toggleMenu}
    >
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
    </div>
  );
};

export default Hamburger;
