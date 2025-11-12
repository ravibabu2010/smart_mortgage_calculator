import React from 'react';
import { HouseIcon } from '../constants';

const Header: React.FC = () => {
  const navItems = [
    { name: 'Calculator', href: '#calculator' },
    { name: 'Summary', href: '#summary' },
    { name: 'Amortization', href: '#amortization' },
    { name: 'About', href: '#about' },
  ];

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-teal-400">
              <HouseIcon className="h-8 w-8" />
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-baseline space-x-4">
                <span className="text-white font-bold text-xl">Smart Mortgage Calculator</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
