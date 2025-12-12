import React, { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { Dashboard } from './components/Dashboard';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [isIntroLoading, setIsIntroLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {isIntroLoading ? (
          <LoadingScreen key="loader" onComplete={() => setIsIntroLoading(false)} />
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;