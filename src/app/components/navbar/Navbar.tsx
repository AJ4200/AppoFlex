"use clientSide"

import React, { useState } from 'react';
import Logo from './Logo';
import Connectbutton from './buttons/Connectbutton';

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <Logo />
        </div>
        <div className={`buttons-container ${isMenuOpen ? 'open' : ''}`}>
          <button className="sign-in-button">Sign In</button>
          <button className="sign-up-button">Sign Up</button>
        </div>
        <div className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
