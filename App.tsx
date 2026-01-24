
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ValueProps from './components/ValueProps';
import ProcessFlow from './components/ProcessFlow';
import ProofSection from './components/ProofSection';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <ProcessFlow />
        <ProofSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
