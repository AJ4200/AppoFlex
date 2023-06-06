import React from "react";

interface ConnectbuttonProps {
  label: string;
}

const Connectbutton: React.FC<ConnectbuttonProps> = ({ label }) => {
  return (
    <button className="connect-button">
      <span>{label}</span>
      <div className="cb-container">
        <svg height="45" width="45" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024" className="icon">
          <path fill="" d="M962.267429 233.179429q-38.253714 56.027429-92.598857 95.451429..."></path>
        </svg>
        <svg height="45" width="45" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024" className="icon">
          <path fill="" d="M123.52064 667.99143l344.526782 229.708899 0-205.136409-190.802457-127.396658..."></path>
        </svg>
        <svg height="45" width="45" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024" className="icon">
          <path fill="" d="M950.930286 512q0 143.433143-83.748571 257.974857t-216.283429 158.573714..."></path>
        </svg>
      </div>
    </button>
  );
};

export default Connectbutton;
