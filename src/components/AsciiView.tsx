import { FC, useRef, useEffect } from 'react';
import { GameData } from '../types/game';
import { renderView } from '../utils/raycasting';

interface AsciiViewProps {
  game: GameData;
}

const AsciiView: FC<AsciiViewProps> = ({ game }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateDimensions = () => {
      if (!container) return;
      
      // Get container dimensions
      const { width, height } = container.getBoundingClientRect();
      
      // Calculate character dimensions based on monospace font
      const testElement = document.createElement('span');
      testElement.innerText = 'X';
      testElement.style.visibility = 'hidden';
      testElement.style.position = 'absolute';
      testElement.classList.add('font-mono');
      container.appendChild(testElement);
      
      const charWidth = testElement.getBoundingClientRect().width;
      const charHeight = testElement.getBoundingClientRect().height * 0.8; // Adjust for line height
      
      container.removeChild(testElement);
      
      // Calculate view dimensions in characters
      const viewWidth = Math.floor(width / charWidth);
      const viewHeight = Math.floor(height / charHeight);
      
      // Render the view
      const view = renderView(
        game.level,
        game.player.position,
        game.player.direction,
        viewWidth,
        viewHeight
      );
      
      // Add crosshair to the center of the view
      const centerX = Math.floor(viewWidth / 2);
      const centerY = Math.floor(viewHeight / 2);
      if (view[centerY] && view[centerY][centerX]) {
        view[centerY][centerX] = '+'; // Crosshair symbol
      }
      
      // Clear previous content
      container.innerHTML = '';
      
      // Create the view
      const pre = document.createElement('pre');
      pre.classList.add('text-green-500', 'leading-none', 'whitespace-pre');
      
      // Join the rows into text
      const text = view.map(row => row.join('')).join('\n');
      pre.textContent = text;
      
      container.appendChild(pre);
    };
    
    // Initial render
    updateDimensions();
    
    // Update dimensions when window resizes
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [game]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-hidden flex items-center justify-center bg-black font-mono"
    />
  );
};

export default AsciiView;
