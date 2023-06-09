import React, { useState } from'react';

interface SigninbuttonProps
{
    onClick: () => void;
}

const Signinbutton: React.FC<SigninbuttonProps> = ({onClick}) => 
 
{return (
    <button 
    className="sign-in-button animate__animated animate__backInLeft" onClick={onClick}>Sign In</button>
); 
}
 
export default Signinbutton;