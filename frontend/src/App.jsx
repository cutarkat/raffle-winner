import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti-boom';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showWinnerName, setShowWinnerName] = useState(false);
  const [placeholderImage, setPlaceholderImage] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const PORT = import.meta.env.VITE_REACT_APP_API_PORT;
  const APP_URL = import.meta.env.VITE_REACT_APP_URL || 'http://localhost';

  const EMPLOYEE_API_URL = `${APP_URL}:${PORT}/api/employees`;
  const EMPLOYEE_IMAGES_API_URL = `${APP_URL}:${PORT}/employees`;

  const PLACEHOLDER_API_URL = `${APP_URL}:${PORT}/api/random-placeholder`;
  const PLACEHOLDER_IMAGES_API_URL = `${APP_URL}:${PORT}/placeholders`;

  // Add a new useEffect to fetch the random placeholder when component mounts
  useEffect(() => {
    const fetchRandomPlaceholder = async () => {
      try {
        const response = await fetch(PLACEHOLDER_API_URL);
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
      const timer = setTimeout(() => {
        setShowWinnerName(true);
      }, 3000); // 3 second delay

      return () => clearTimeout(timer); // Cleanup the timer on component unmount or when showWinner changes
    } else {
      setShowWinnerName(false);
    }
  }, [showWinner]);

  // Fetch employees data from Express backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(EMPLOYEE_API_URL);
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

  const getRandomEmployee = useCallback(() => {
    return employees[Math.floor(Math.random() * employees.length)];
  }, [employees]);

  const drawWinner = useCallback(() => {
    if (isDrawing || employees.length === 0) return;

    setIsDrawing(true);
    setShowWinner(false);
    let speed = 50;
    let duration = 0;
    const maxDuration = 7000;
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
              No employee photos found. Please add photos to the "participants" directory.
            </div>
          ) : (
            <div
              className="relative w-[80vh] max-w-[90vw] aspect-square border-8 border-yellow-500 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              {!isDrawing && currentIndex === 0 ? (
                <img
                  src={`${PLACEHOLDER_IMAGES_API_URL}/${placeholderImage}`}
                  alt="Click Draw to Start"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  {employees.map((employee, index) => (
                    <img
                      key={employee.id}
                      src={`${EMPLOYEE_IMAGES_API_URL}${employee.image}`}
                      alt={employee.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200
                        ${index === currentIndex && (isDrawing || showWinner) ? 'opacity-100' : 'opacity-0'}`}
                    />
                  ))}
                  {showWinner && (
                    <div className={`absolute w-full bottom-20 left-1/2 transform -translate-x-1/2 
                                uppercase text-2xl font-bold text-orange-100 drop-shadow-lg bg-black/60 p-4 z-10
                                transition-opacity duration-1000 ${showWinnerName ? 'opacity-100' : 'opacity-0'} text-center outline-text`}>
                      <span className="w-100 align-text-bottom">🎉</span> {winner?.name} <span className="w-100 align-text-bottom">🎉</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={drawWinner}
            disabled={isDrawing || employees.length === 0}
            className={`px-10 py-5 text-1xl font-bold tracking-wider uppercase rounded-xl
                      transform transition-all duration-300 shadow-lg
                      ${isDrawing || employees.length === 0
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-orange-600 hover:-translate-y-1 hover:shadow-xl'
              }`}
          >
            Draw!
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;