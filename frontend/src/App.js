import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showWinnerName, setShowWinnerName] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showWinner) {
      const timer = setTimeout(() => {
        setShowWinnerName(true);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer); // Cleanup the timer on component unmount or when showWinner changes
    } else {
      setShowWinnerName(false);
    }
  }, [showWinner]);

  // Fetch employees data from Express backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/employees');
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        setEmployees(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getRandomEmployee = useCallback(() => {
    return employees[Math.floor(Math.random() * employees.length)];
  }, [employees]);

  const drawWinner = useCallback(() => {
    if (isDrawing || employees.length === 0) return;

    setIsDrawing(true);
    setShowWinner(false);
    let speed = 50;
    let duration = 0;
    const maxDuration = 5000;
    const slowdownFactor = 1.1;

    const animate = () => {
      setCurrentIndex(prev => (prev + 1) % employees.length);
      duration += speed;

      if (duration < maxDuration) {
        speed = Math.min(speed * slowdownFactor, 500);
        setTimeout(animate, speed);
      } else {
        const selectedWinner = getRandomEmployee();
        setWinner(selectedWinner);
        setCurrentIndex(employees.indexOf(selectedWinner));
        setShowWinner(true);
        setIsDrawing(false);
      }
    };

    animate();
  }, [isDrawing, getRandomEmployee, employees]);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.code === 'Space' && !isDrawing) {
        e.preventDefault();
        drawWinner();
      } else if (e.code === 'F11' || e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [drawWinner, isDrawing]);

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
      style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
        <h5 className="uppercase first-line:font-bold text-orange-500 text-center mb-3">
          Sprobe Year-End 2024 - Raffle Draw
        </h5>
        <h1 className="text-4xl font-bold text-orange-700 text-center mb-3">
          Who's the Lucky Winner?
        </h1>

        <div className="relative flex-1 flex flex-col items-center justify-center">
          {employees.length === 0 ? (
            <div className="text-2xl text-yellow-400">
              No employee photos found. Please add photos to the "employee-photos" directory.
            </div>
          ) : (
            <div
              className="relative w-[80vh] max-w-[90vw] aspect-square border-8 border-yellow-500 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              {employees.map((employee, index) => (
                <img
                  key={employee.id}
                  src={`http://localhost:3001/images${employee.image}`}
                  alt={employee.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200
                    ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              {showWinner && showWinnerName && <Confetti /> && (
                <div className="absolute w-full bottom-20 left-1/2 transform -translate-x-1/2 
                              uppercase text-2xl font-bold text-orange-100 drop-shadow-lg bg-black/60 p-4 z-10
                              opacity-100 transition-opacity duration-500 text-center outline-text">
                  <span className=" align-text-bottom">🎉</span> {winner?.name} <span className=" align-text-bottom">🎉</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={drawWinner}
            disabled={isDrawing || employees.length === 0}
            className={`px-10 py-6 text-2xl font-bold tracking-wider uppercase rounded-xl
                      transform transition-all duration-300 shadow-lg
                      ${isDrawing || employees.length === 0
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-orange-600 hover:-translate-y-1 hover:shadow-xl'
              }`}
          >
            Draw!
          </button>
        </div>

        {/* <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 px-6 py-3 text-lg bg-blue-500/30 
                    border-2 border-blue-500 rounded-lg hover:bg-blue-500/50
                    transition-colors duration-300"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </button> */}
      </div>
    </div>
  );
};

export default App;