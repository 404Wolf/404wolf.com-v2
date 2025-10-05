import { useEffect, useState } from "react";

export interface RandomCoverProps {
  covers: string[];
  /** Frequency of random cover change, in milliseconds */
  changeFrequency?: number;
  children?: React.ReactNode;
}

export function RandomCover({
  covers,
  changeFrequency = 3000,
  children,
}: RandomCoverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!covers || covers.length === 0) return;

    // Set initial random index
    setCurrentIndex(Math.floor(Math.random() * covers.length));

    if (!changeFrequency) return;

    const interval = setInterval(() => {
      setCurrentIndex(Math.floor(Math.random() * covers.length));
    }, changeFrequency);

    return () => clearInterval(interval);
  }, [covers, changeFrequency]);

  if (!covers || covers.length === 0) {
    return null;
  }

  const selectedCover = covers[currentIndex];

  return (
    <div
      className="bg-cover bg-center rounded transition-all h-24 lg:h-20 hover:brightness-[95%] hover:scale-[103%] duration-50 ease-in"
      style={{ backgroundImage: `url('${selectedCover}')` }}
    >
      {children}
    </div>
  );
}
