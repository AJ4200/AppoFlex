import React, { useState } from 'react';

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
    <form className="form" onSubmit={handleSubmit}>
      <div className="title">
        Welcome,
        <br />
        <span>sign up to continue</span>
      </div>
      <label>
        Email:
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
        Password:
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
        Reconfirm Password:
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
        Business Name:
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
        Business Type:
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
        Let's go →
      </button>
    </form>
  );
};

export default Signup;
