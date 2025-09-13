import { useState } from 'react';
import Navigation from '../Navigation';

export default function NavigationExample() {
  const [currentPage, setCurrentPage] = useState<'timer' | 'history' | 'settings'>('timer');

  return (
    <div className="relative h-20">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
    </div>
  );
}