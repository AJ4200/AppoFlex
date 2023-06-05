"use client"
import React, { useEffect, useState } from "react";
import Splashloader from "./Splashloader";
import Splashbackground from "./Splashbackground";

interface SplashProps {
  title: string;
}

const Splash: React.FC<SplashProps> = ({ title }) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 4000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Splashbackground />
      <div className="typewriter-container">
        <div className="typewriter">
          <h1>{title}</h1>
          {showLoader ? <Splashloader /> : null}
        </div>
      </div>
    </>
  );
};

export default Splash;
