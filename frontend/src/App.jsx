import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti-boom';

const API_URLS = {
  participants: `${import.meta.env.VITE_REACT_APP_URL || 'http://localhost'}:${import.meta.env.VITE_REACT_APP_API_PORT}/api/participants`,
  images: `${import.meta.env.VITE_REACT_APP_URL || 'http://localhost'}:${import.meta.env.VITE_REACT_APP_API_PORT}/participants`,
  placeholder: `${import.meta.env.VITE_REACT_APP_URL || 'http://localhost'}:${import.meta.env.VITE_REACT_APP_API_PORT}/api/random-placeholder`,
  placeholderImage: `${import.meta.env.VITE_REACT_APP_URL || 'http://localhost'}:${import.meta.env.VITE_REACT_APP_API_PORT}/placeholders`,
};

// Placeholder Component
const Placeholder = ({ image }) => (
  <img
    src={image}
    alt="Click Draw to Start"
    className="absolute inset-0 w-full h-full object-cover"
  />
);

// Participant Component
const ParticipantImage = ({ participants, currentIndex, isDrawing, showWinner }) =>
  participants.map((employee, index) => (
    <img
      key={employee.id}
      src={`${API_URLS.images}${employee.image}`}
      alt={employee.name}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200
        ${index === currentIndex && (isDrawing || showWinner) ? 'opacity-100' : 'opacity-0'}`}
    />
  ));

// Winner Display Component with Congratulations
const WinnerDisplay = ({ showWinnerName, winner }) => {
  const [showCongratulations, setShowCongratulations] = useState(false);

  useEffect(() => {
    if (showWinnerName) {
      const timer = setTimeout(() => setShowCongratulations(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowCongratulations(false);
    }
  }, [showWinnerName]);

  return (
    <>
      <div className={`absolute w-full bottom-16 left-1/2 transform -translate-x-1/2 
        font-bold text-orange-100 drop-shadow-lg bg-black/70 p-4 z-10 text-2xl uppercase
        transition-opacity duration-1000 ${showWinnerName ? 'opacity-100' : 'opacity-0'}
        flex justify-center items-center gap-4 text-center outline-text`}>
        <span className='w-auto flex items-center mb-2 ms-5 text-4xl'>🎉</span>
        <span className='w-auto flex items-center justify-center text-glow-yellow-500'>{winner?.name}</span>
        <span className='w-auto flex items-center mb-2 me-5 text-4xl'>🎉</span>
      </div>
      <Congratulations showCongratulations={showCongratulations} />
    </>
  );
};

const Congratulations = ({ showCongratulations }) => (
  <div className={`absolute w-full bottom-4 left-1/2 transform -translate-x-1/2 
    text-2xl font-bold text-yellow-400 z-10 text-glow-orange-500
    transition-opacity duration-1000 ${showCongratulations ? 'opacity-100' : 'opacity-0'}
    text-center outline-text`}>
    Congratulations!
  </div>
);

const App = () => {
  const [participants, setParticipants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showWinnerName, setShowWinnerName] = useState(false);
  const [placeholderImage, setPlaceholderImage] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomPlaceholder = async () => {
      try {
        const response = await fetch(API_URLS.placeholder);
        if (!response.ok) throw new Error('Failed to fetch placeholder');
        const data = await response.json();
        setPlaceholderImage(data.image);
      } catch (err) {
        console.error('Error fetching placeholder:', err);
      }
    };

    fetchRandomPlaceholder();
  }, []);

  useEffect(() => {
    if (showWinner) {
      const timer = setTimeout(() => setShowWinnerName(true), 2500);
      return () => clearTimeout(timer);
    } else {
      setShowWinnerName(false);
    }
  }, [showWinner]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(API_URLS.participants);
        if (!response.ok) throw new Error('Failed to fetch participants');
        const data = await response.json();
        setParticipants(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  const getRandomUniqueParticipant = useCallback(() => {
    const eligibleParticipants = participants.filter(
      (participant) => !winners.includes(participant.id)
    );

    if (eligibleParticipants.length === 0) {
      console.warn('No eligible participants left to draw!');
      return null; // No more eligible participants
    }

    return eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
  }, [participants, winners]);

  const drawWinner = useCallback(() => {
    if (isDrawing || participants.length === 0) return;

    setIsDrawing(true);
    setShowWinner(false);

    let speed = 50;
    let duration = 0;
    const maxDuration = 8000;
    const slowdownFactor = 1.1;

    const animate = () => {
      setCurrentIndex((prev) => {
        // Ensure the next index is not 0
        const nextIndex = (prev + 1) % participants.length;
        return nextIndex === 0 ? 1 : nextIndex;
      });
      
      duration += speed;

      if (duration < maxDuration) {
        speed = Math.min(speed * slowdownFactor, 500);
        setTimeout(animate, speed);
      } else {
        const selectedWinner = getRandomUniqueParticipant();

        if (selectedWinner) {
          const winnerIndex = participants.indexOf(selectedWinner);
          // If winner index is 0, use index 1 instead
          setCurrentIndex(winnerIndex === 0 ? 1 : winnerIndex);
          setWinner(selectedWinner);
          setShowWinner(true);
          setWinners((prevWinners) => [...prevWinners, selectedWinner.id]);
        } else {
          console.warn('No winner selected. All participants have already won.');
        }

        setIsDrawing(false);
      }
    };

    animate();
  }, [isDrawing, getRandomUniqueParticipant, participants]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-3xl">Loading employee data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-3xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {showWinner && (
        <>
          <Confetti
            colors={['#ff5353', '#ffee53', '#53ffa9', '#5395ff', '#ef53ff']}
            mode="boom"
            x={1}
            y={1}
            particleCount={400}
            shapeSize={30}
            deg={180}
            effectCount="Infinity"
            effectInterval={2000}
            spreadDeg={100}
            launchSpeed={3} />
          <Confetti
            colors={['#ff5353', '#ffee53', '#53ffa9', '#5395ff', '#ef53ff']}
            mode="boom"
            x={0}
            y={1}
            particleCount={400}
            shapeSize={30}
            deg={0}
            effectCount="Infinity"
            effectInterval={2000}
            spreadDeg={100}
            launchSpeed={3} />
        </>
      )}
      <div className="container mx-auto px-4 py-6 flex flex-col min-h-screen">
        <h1 className="text-3xl text-glow-orange-200 font-bold text-orange-600 text-center mb-2">
          Who's the Lucky Winner?
        </h1>

        <div className="relative flex-1 flex flex-col items-center justify-start mt-3">
          {participants.length === 0 ? (
            <div className="text-2xl text-yellow-400">
              No employee photos found. Please add photos to the "participants" directory.
            </div>
          ) : (
            <div
              className="relative w-[80vh] max-w-[90vw] aspect-square border-8 border-yellow-500 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              {!isDrawing && currentIndex === 0 ? (
                <Placeholder image={`${API_URLS.placeholderImage}/${placeholderImage}`} />
              ) : (
                <>
                  <ParticipantImage
                    participants={participants}
                    currentIndex={currentIndex}
                    isDrawing={isDrawing}
                    showWinner={showWinner}
                  />
                  {showWinner && <WinnerDisplay showWinnerName={showWinnerName} winner={winner} />}
                </>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={drawWinner}
            disabled={isDrawing || participants.length === 0}
            className={`px-8 py-4 text-md font-bold tracking-wider uppercase rounded-xl
                      transform transition-all duration-300 shadow-lg
                      ${isDrawing || participants.length === 0
                ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-orange-900 hover:bg-orange-600 hover:text-orange-100 hover:-translate-y-1 hover:shadow-xl'
              }`}
            aria-label="Start the raffle draw"
          >
            Draw!
          </button>
        </div>
      </div>
      <code className="fixed bottom-2 left-2 text-xs text-white py-2 px-2">
        © {new Date().getFullYear()} Sprobe Year-End 2024 - Raffle Winner Picker
      </code>
    </div>
  );
};

export default App;
