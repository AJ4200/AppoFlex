import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import Signinbutton from "./buttons/Signinbutton";
import Signupbutton from "./buttons/Signupbutton";
import Signin from "../home/Signin";
import Signup from "../home/Signup";
import Hamburger from "./Hamburger";

const Navbar: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showMenuList, setShowMenuList] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
    setShowMenuList(true);
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
      <nav className={`navbar ${isMenuOpen ? "open" : ""}`}>
        <div className="logo-container">
          <Logo />
        </div>
        <div className={`buttons-container ${isMenuOpen ? "open" : ""}`}>
          {!showSignin && <Signinbutton onClick={handleSigninClick} />}
          {showSignin && <Signin />}
          {!showSignup && <Signupbutton onClick={handleSignupClick} />}
          {showSignup && <Signup />}
        </div>
        <Hamburger isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        {showMenuList && (
          <ul className={`menu-list ${isMenuOpen ? "open" : ""}`}>
            {!showSignin && (
              <li>
                <Signinbutton onClick={handleSigninClick} />
              </li>
            )}
            {showSignin && (
              <li>
                <Signin />
              </li>
            )}
            {!showSignup && (
              <li>
                <Signupbutton onClick={handleSignupClick} />
              </li>
            )}
            {showSignup && (
              <li>
                <Signup />
              </li>
            )}
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
