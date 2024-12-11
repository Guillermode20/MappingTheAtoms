import { useState, useEffect } from 'react';
import Map from './components/Map'; // Changed to default import

const App = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const doc = document.documentElement;

    if (!isFullscreen) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen();
      } else if (doc.webkitRequestFullscreen) { /* Safari */
        doc.webkitRequestFullscreen();
      } else if (doc.msRequestFullscreen) { /* IE11 */
        doc.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
  
    document.addEventListener('fullscreenchange', onFullscreenChange);
  
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen h-screen bg-[#0a0a0a] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-200 flex flex-col overflow-hidden">
      <header className={`backdrop-blur-2xl bg-zinc-900 border-b border-zinc-700 shadow-2xl shadow-black ${isFullscreen ? 'hidden' : 'p-4'}`}>
        <h1 className="text-4xl sm:text-5xl font-black text-center tracking-tighter text-zinc-200 drop-shadow-[0_0_30px_rgba(244,244,245,0.2)]">
          Mapping The Atoms
        </h1>
      </header>

      <main className={`flex-1 ${isFullscreen ? 'p-0' : 'p-4'}`}>
        <div className={`relative flex flex-col h-full backdrop-blur-xl bg-zinc-900 rounded-lg sm:rounded-3xl border border-zinc-700 ${isFullscreen ? 'rounded-none p-0' : 'p-4 md:p-10'} shadow-[0_0_50px_-12px_rgba(0,0,0,0.9)] backdrop-saturate-150 ring-1 ring-zinc-700/50`}>
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-[1001] px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
          <section className="flex-1 h-full">
            <Map isFullscreen={isFullscreen} />
          </section>
        </div>
      </main>

      <footer className={`backdrop-blur-xl bg-zinc-900 border-t border-zinc-700 ${isFullscreen ? 'hidden' : 'p-4'}`}>
        <p className="text-center text-zinc-500 text-sm font-medium tracking-wide">
          © {new Date().getFullYear()} Mapping The Atoms
        </p>
      </footer>
    </div>
  );
};

export default App;