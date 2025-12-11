import React from 'react'

export default function Navigation ({ currentPage, setCurrentPage }){
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-lg py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <button onClick={() => setCurrentPage('home')} className="text-3xl font-bold text-white tracking-wider">
          Photo<span className="text-purple-400">Studio</span>
        </button>
        <div className="flex gap-8">
          {[
            { name: 'Home', page: 'home' },
            { name: 'About Us', page: 'about' },
            { name: 'Contact', page: 'contact' }
          ].map(({ name, page }) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-lg transition-all duration-300 hover:text-purple-400 ${
                currentPage === page ? 'text-purple-400 font-semibold' : 'text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};