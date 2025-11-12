import React from 'react';

const About: React.FC = () => {
  return (
    <div id="about" className="bg-slate-800 p-8 rounded-2xl shadow-2xl mt-12">
      <h2 className="text-3xl font-bold text-white text-center mb-6">About The Smart Mortgage Calculator</h2>
      <div className="max-w-4xl mx-auto text-slate-300 space-y-4 text-lg">
        <p>
          Welcome to the Smart Mortgage Calculator! Our goal is to empower you with a comprehensive, transparent, and easy-to-use tool to navigate one of the most significant financial decisions of your life: buying a home.
        </p>
        <p>
          This calculator is designed for everyone, from first-time homebuyers to seasoned real estate investors looking to refinance. We go beyond simple payment calculations to give you a complete picture of your mortgage, including:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><span className="font-semibold text-green-400">Detailed Cost Breakdowns:</span> Understand how your monthly payment is allocated between principal, interest, property taxes, homeowner's insurance, PMI, and HOA fees with our visual PITI chart.</li>
          <li><span className="font-semibold text-yellow-400">Advanced Scenarios:</span> Explore different loan types (Conventional, Jumbo, FHA, VA), see the impact of extra payments, and compare monthly vs. bi-weekly payment schedules.</li>
          <li><span className="font-semibold text-teal-400">Powerful Visualizations:</span> With interactive charts and a full amortization schedule, you can visualize your loan balance decreasing over time and see exactly how much you'll save by paying your loan off early.</li>
          <li><span className="font-semibold text-blue-400">Comparison Mode:</span> Analyze two different loan scenarios side-by-side to make the best possible decision for your financial future.</li>
        </ul>
        <p className="pt-4 text-center text-slate-400">
          We believe that a well-informed decision is a smart decision. Use this tool to experiment with different options, plan for the future, and take control of your homeownership journey.
        </p>
      </div>
    </div>
  );
};

export default About;
