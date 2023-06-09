"use clientSide";

import React, { useState } from "react";
import Logo from "./Logo";
import Signinbutton from "./buttons/Signinbutton";
import Signupbutton from "./buttons/Signupbutton";
import Signin from "../home/Signin";
import Signup from "../home/Signup";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleSigninClick = () => {
    setShowSignin(true);
    setShowSignup(false);
  };
  const handleSignupClick = () => {
    setShowSignup(true);
    setShowSignin(false);
  };
  return (
    <header>
      <nav className={`navbar ${isMenuOpen ? "open" : ""} `}>
        <div className="logo-container">
          <Logo />
        </div>
        <div className={`buttons-container ${isMenuOpen ? "open" : ""}`}>
          {!showSignin && <Signinbutton onClick={handleSigninClick} />}
          {showSignin && <Signin />}
          {!showSignup && <Signupbutton onClick={handleSignupClick} />}
          {showSignup && <Signup />}

        </div>
        <div
          className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
