import React from "react";

interface SignupbuttonProps
{
  onClick : () => void;
}

const Signupbutton: React.FC<SignupbuttonProps> = ({onClick}) => {
  return <button className="sign-up-button animate__animated animate__backInRight" onClick={onClick}>Sign Up</button>;
};

export default Signupbutton;
