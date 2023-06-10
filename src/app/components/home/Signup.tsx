import React, { useState } from 'react';
import ChuckNorrisJoke from '../utils/ChuckNorrisjoke';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reconfirmPassword, setReconfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // handle form submission
  };

  return (
    <form className="form animate__animated animate__backInRight" onSubmit={handleSubmit}>
      <div className="title">
        Welcome,
        <br />
        <span>sign up to continue</span>
      </div>
      <label>
     
        <input
          className="input"
          name="email"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>

        <input
          className="input"
          name="password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label>
   
        <input
          className="input"
          name="reconfirmPassword"
          placeholder="Reconfirm Password"
          type="password"
          value={reconfirmPassword}
          onChange={(e) => setReconfirmPassword(e.target.value)}
        />
      </label>
      <label>
        <input
          className="input"
          name="businessName"
          placeholder="Business Name"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </label>
      <label>
        <input
          className="input"
          name="businessType"
          placeholder="Business Type"
          type="text"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        />
      </label>
      <button type="submit" className="button-confirm">
      →<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-door-open-fill" viewBox="0 0 16 16">
  <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15H1.5zM11 2h.5a.5.5 0 0 1 .5.5V15h-1V2zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1z"/>
</svg>
      </button>
    </form>
   
  );
};

export default Signup;
