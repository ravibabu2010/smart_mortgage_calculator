
# Smart Mortgage Calculator

A comprehensive, AI-enhanced mortgage calculator built with React, TypeScript, and the Google Gemini API. This tool empowers users with a transparent and easy-to-use interface to navigate home financing decisions. It goes beyond simple payment calculations to provide a complete picture of a mortgage, including detailed cost breakdowns, advanced payment scenarios, and powerful side-by-side comparisons.

## ✨ Key Features

- **Dual Calculator Modes**: Supports both **New Purchase** and **Refinance** scenarios.
- **Detailed Cost Inputs**: Accounts for Property Taxes, Homeowner's Insurance, PMI, HOA fees, and custom Loan Origination Fees.
- **Loan Program Simulation**: Handles different loan types (Conventional, Jumbo, FHA, VA) with automatic adjustments for program-specific fees.
- **Flexible Extra Payments**: Allows users to model recurring, one-time, or annual extra principal payments to see how it accelerates payoff.
- **Payment Frequency Options**: Compare monthly vs. bi-weekly payment schedules to understand potential interest savings.
- **Interactive Visualizations**: Features a loan balance chart and monthly payment breakdown pie charts powered by Recharts.
- **Full Amortization Schedule**: A detailed, period-by-period table showing the breakdown of each payment.
- **Data Export**: Users can export the loan summary as a PDF and the full amortization schedule as a CSV file.
- **Powerful Comparison View**: Analyze two different loan scenarios side-by-side to make an informed decision.
- **🤖 AI-Powered Features**:
  - **Interest Rate Comparison**: Fetches current average 30-year and 15-year interest rates using the Google Gemini API to set up a quick comparison.
  - **Property Tax Estimation**: Automatically estimates the annual property tax rate for a given US zip code, powered by the Gemini API.

## 💻 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: Google Gemini API
- **PDF/CSV Export**: jsPDF, html2canvas

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/smart-mortgage-calculator.git
    cd smart-mortgage-calculator
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a new file named `.env` in the root of your project.
    -   Add your Google Gemini API key to this file. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    > **Security Note:** This setup is for local development only. For production, the API key must be protected on a secure backend server. See `SECURITY.md` for more details.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

### Available Scripts

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Compiles the TypeScript and React code into a production-ready build in the `dist/` directory.
-   `npm run preview`: Serves the production build locally to preview it before deployment.

---

## 📂 Project Structure

The project is organized into a standard directory structure for scalability and maintainability.

```
/
├── public/             # Static assets and the main index.html
├── src/
│   ├── components/     # Reusable React components
│   ├── constants/      # App-wide constants (e.g., icons)
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component and layout
│   └── index.tsx       # Application entry point
├── .env.example        # Example environment file
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

### Core Logic Files

-   **`src/hooks/useMortgageCalculator.ts`**: This is the heart of the calculator. This custom hook contains all the financial logic for calculating payments, generating the amortization schedule, and summarizing the loan details.
-   **`src/App.tsx`**: The main component that manages the application's state, handles scenario comparisons, and orchestrates the different UI components. The AI-powered interest rate comparison logic resides here.
-   **`src/components/ZipcodeSearch.tsx`**: This component contains the logic for the AI-powered zip code and tax rate lookup feature.
-   **`src/components/CalculatorForm.tsx`**: The primary form component where users input their loan details.
-   **`src/types/index.ts`**: Defines all the core data structures and types used throughout the application.
