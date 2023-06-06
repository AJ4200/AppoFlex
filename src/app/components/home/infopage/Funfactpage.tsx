import React, { useEffect, useState } from "react";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const Funfactpage: React.FC = () => {
  const [artData, setArtData] = useState<any>(null);
  const [randomImage, setRandomImage] = useState<string>("");

  useEffect(() => {
    const fetchArtData = async () => {
      const randomId = Math.floor(Math.random() * 100000); // Generate a random ID

      try {
        const response = await axios.get(`https://api.artic.edu/api/v1/artworks/${randomId}`);
        setArtData(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArtData();
  }, []);

  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        const response = await axios.get("https://api.unsplash.com/photos/random", {
          params: {
            client_id: 'yHWXdi3UuIHRFUtTBujs3UzOwfFvEUtdhWt0DwKndKQ',
            client_secret: 'GYivH3pRBWhJnbWyLN7hdpJJIlriKSK70EDqjSYzXBM',
          },
        });
        setRandomImage(response.data.urls.regular);
      } catch (error) {
        console.error(error);
      }
    };
    

    fetchRandomImage();
  }, []);

  return (
    <aside className="funfact-card">
      <h1>Fun Fact:</h1>
      {randomImage && <img className='artwork-image' src={randomImage} alt="Random Artwork" />}
      {artData ? (
        <>
          <p className="typingeffect">Year: {artData.date_display}</p>
          <p className="typingeffect">Name: {artData.title ? artData.title : "N/A"}</p>
        </>
      ) : (
        <p className="typingeffect">Loading art data...</p>
      )}
    </aside>
  );
};

export default Funfactpage;
