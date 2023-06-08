"use client"
import React, { useState, useEffect } from 'react';
import Splash from './components/splash/Splash';
import Infopage from './components/home/infopage/Infopage';
import Navbar from './components/navbar/Navbar';
import Splashbackground from './components/splash/Splashbackground';
import Otherproducts from './components/home/infopage/Otherproducts';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    },7000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
    <Splashbackground/>
      {showSplash ? (
        <Splash title="AppoFlex." />
      ) : (
  <><Navbar />
  <div className='home-container'>
  <Infopage />
  <Otherproducts />
    
  </div>
</>
      )}
    </>
  );
}
