import React, { useState } from 'react'; 

const Signin: React.FC = () => { 


 const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { 
   event.preventDefault(); 
   // handle form submission 
 }; 

  return ( 
   <form className="form animate__animated animate__backInLeft" onSubmit={handleSubmit}> 
     <div className="title"> 
       Welcome, 
       <br /> 
       <span>sign in to continue</span> 
     </div> 
     <label>
      <input
        className={`input`}
        name="email"
        placeholder="Email"
        type="email"
      />
    </label>
     <label> 
       <input className="input" name="password" placeholder="Password" type="password" /> 
     </label> 
     <div className="login-with"> 
       <div className="button-log"></div> 
       <div className="button-log"> 
       </div> 
       <div className="button-log"> 
   
       </div> 
     </div> 
     <button type="submit" className="button-confirm"> 
       Let`s go → 
     </button> 

   </form> 
 ); 
}; 
export default Signin;