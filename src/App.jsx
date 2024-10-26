import React, { useState, useEffect } from 'react';
import md5 from 'md5'; // Import md5 library
import './App.css';

function App() {
  const [characters, setCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minComics, setMinComics] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const apiKey = import.meta.env.VITE_MARVEL_PUBLIC_KEY; // Access public key from Vite environment variables
      const privateKey = import.meta.env.VITE_MARVEL_PRIVATE_KEY; // Access private key from Vite environment variables

      if (!apiKey || !privateKey) {
        console.error("API keys are missing. Please check your environment variables.");
        return;
      }

      const ts = new Date().getTime(); // Generate a timestamp
      const hash = md5(ts + privateKey + apiKey); // Generate MD5 hash
      
      try {
        const response = await fetch(
          `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${apiKey}&hash=${hash}`
        );

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCharacters(data.data.results || []); // Safeguard in case results are undefined
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalCharacters = characters.length;
  const averageComicsAppearances =
    totalCharacters > 0
      ? (characters.reduce((sum, character) => sum + character.comics.available, 0) / totalCharacters)
      : 0;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMinComicsChange = (event) => {
    setMinComics(parseInt(event.target.value, 10) || 0); // Default to 0 if NaN
  };

  const filteredCharacters = characters
    .filter((character) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((character) => character.comics.available >= minComics);

  return (
    <div>
      <h1>Marvel Characters Dashboard</h1>
      
      {/* Search Bar */}
      <input 
        type="text" 
        placeholder="Search Characters..." 
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {/* Min Comics Filter */}
      <input 
        type="number" 
        placeholder="Min Comics Appearances" 
        value={minComics}
        onChange={handleMinComicsChange}
      />

      <h2>Total Characters: {totalCharacters}</h2>
      <h2>Average Comics Appearances: {averageComicsAppearances.toFixed(2)}</h2>

      {filteredCharacters.length > 0 ? (
        <ul>
          {filteredCharacters.map((character) => (
            <li key={character.id}>
              {/* Safely render character thumbnail */}
              {character.thumbnail && (
                <img 
                  src={`${character.thumbnail.path}.${character.thumbnail.extension}`} 
                  alt={character.name} 
                />
              )}
              <h3>{character.name}</h3>
            </li>
          ))}
        </ul>
      ) : (
        <p>No characters found.</p> // Message when no characters match the filters
      )}
    </div>
  );
}

export default App;
