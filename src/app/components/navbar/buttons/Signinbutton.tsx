import React, { useState } from'react';

interface SigninbuttonProps
{
    onClick: () => void;
}

const Signinbutton: React.FC<SigninbuttonProps> = ({onClick}) => 
 
{return (
    <button 
    className="sign-in-button" onClick={onClick}>Sign In</button>
); 
}
 
export default Signinbutton;