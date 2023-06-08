"use clientSide"

import React, { useState } from 'react';
import Logo from './Logo';
import Connectbutton from './buttons/Connectbutton';
import Signinbutton from './buttons/Signinbutton';
import Signupbutton from './buttons/Signupbutton';

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
          <Signinbutton/>
          <Signupbutton/>
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
