import { useEffect, useState } from 'react';

const ChuckNorrisJoke = () => {
  const [joke, setJoke] = useState('');
  
  useEffect(() => {
    // Fetch a new joke initially
    fetchJoke();

    // Fetch a new joke every 15 seconds
    const interval = setInterval(fetchJoke, 5000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const fetchJoke = async () => {
    try {
      const response = await fetch('https://api.chucknorris.io/jokes/random');
      const data = await response.json();
      setJoke(data.value);
    } catch (error) {
      console.error('Error fetching joke:', error);
    }
  };

  return (
    <div className='carousel'>
      <div className='slide'>
        <div className='joke'>{joke}</div>
      </div>
    </div>
  );
};

export default ChuckNorrisJoke;
