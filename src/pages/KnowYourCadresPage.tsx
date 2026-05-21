import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import KnowYourCadres from '@/components/landing/KnowYourCadres';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

const KnowYourCadresPage: React.FC = () => (
  <div className="min-h-screen bg-background overflow-x-hidden">
    <Header />
    <main className="pt-16">
      <BackButton to="/" />
      <KnowYourCadres />
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
);

export default KnowYourCadresPage;