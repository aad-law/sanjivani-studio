// Progressive Image Component for fast loading


import React from 'react'

export default function ProgressiveImage ({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3C/svg%3E');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`${className} transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
    />
  );
};


