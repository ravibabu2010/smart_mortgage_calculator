import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 mt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-6">
          <a href="#about" className="text-slate-400 hover:text-slate-300">About</a>
          <a href="#terms" className="text-slate-400 hover:text-slate-300">Terms of Service</a>
          <a href="#privacy" className="text-slate-400 hover:text-slate-300">Privacy Policy</a>
        </div>
        <p className="mt-8 text-center text-base text-slate-400">
          &copy; {new Date().getFullYear()} Smart Mortgage Calculator. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
