# Smart Mortgage Calculator

Welcome to the Smart Mortgage Calculator! This is a comprehensive, modern web application designed to empower users with a transparent and powerful tool for navigating mortgage financing. Built with React, TypeScript, and Vite, it offers detailed calculations, scenario comparisons, and data visualizations to help users make informed financial decisions.

The application integrates the Google Gemini API to provide real-time, AI-driven data for features like estimating local property tax rates and fetching current average mortgage interest rates.

![Smart Mortgage Calculator Screenshot](https://storage.googleapis.com/aistudio-project-marketplace/showcase-images/mortgage-calculator/screenshot.png)

## ✨ Features

- **PITI+M Calculation**: Calculates Principal, Interest, Taxes, Insurance, PMI, and monthly HOA fees.
- **Purchase & Refinance Modes**: Supports calculations for both new home purchases and mortgage refinancing.
- **Loan Type Specialization**: Includes logic for Conventional, Jumbo, FHA, and VA loans, automatically adding relevant fees like the FHA Upfront MIP or VA Funding Fee.
- **Advanced Tax Calculation**:
    - **AI-Powered Tax Estimation**: Uses the Gemini API to find the average property tax rate for a given US zip code.
    - **Homestead Exemption**: Allows users to factor in homestead exemptions for more accurate tax estimates.
- **Accelerated Payoff Planning**: Model the impact of extra payments (Recurring, One-Time, or Annual) to see how quickly the loan can be paid off.
- **Flexible Payment Frequencies**: Compare monthly vs. bi-weekly payment schedules to understand potential interest savings.
- **Dynamic Scenario Comparison**:
    - **Side-by-Side View**: Compare two different loan scenarios in a detailed, parallel layout.
    - **AI-Powered Rate Comparison**: A "Compare 30 vs 15 Year" feature fetches current average interest rates from the Gemini API and automatically sets up a comparison.
- **Data Visualization**:
    - **Interactive Pie Charts**: See breakdowns of your monthly payment and the total cost of the loan over its lifetime.
    - **Amortization Chart**: An area chart visualizes the loan balance decreasing over time for one or both scenarios.
- **Full Amortization Schedule**: A detailed, paginated table shows the breakdown of each payment over the life of the loan.
- **Export Functionality**: Export the loan summary as a **PDF** and the full amortization schedule as a **CSV** file.
- **Responsive & Modern UI**: Clean, intuitive interface built with Tailwind CSS that works seamlessly on all devices.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charting**: Recharts
- **PDF Generation**: jsPDF, html2canvas
- **AI/Data**: Google Gemini API

## 📂 Project Structure

The project follows a standard Vite + React project structure to ensure maintainability and scalability.

```
smart-mortgage-calculator/
├── public/
│   └── index.html         # Public HTML entry point
├── src/
│   ├── components/        # Reusable React components
│   ├── constants/         # Application constants & icons
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # CSS files and Tailwind config
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # React DOM render entry point
├── .env.local             # Local environment variables (API Key) - DO NOT COMMIT
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-mortgage-calculator.git
cd smart-mortgage-calculator
```

### 2. Install Dependencies

```bash
npm install
```
or
```bash
yarn install
```

### 3. Configure Environment Variables

The application uses the Google Gemini API. You need to provide an API key for the AI-powered features to work.

1.  Create a new file named `.env.local` in the root of the project.
2.  Add your API key to this file:

    ```
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

    *   **Important**: The `VITE_` prefix is required by Vite to expose the variable to the client-side code.
    *   The `.env.local` file is listed in `.gitignore` and should **never** be committed to your repository.

### 4. Run the Development Server

```bash
npm run dev
```

This will start the Vite development server. Open your browser and navigate to `http://localhost:5173` (or the URL provided in your terminal) to see the application running.

### 5. Build for Production

To create a production-ready build of the app:

```bash
npm run build
```

This command will generate a `dist/` directory with optimized, static files that are ready to be deployed to any web hosting service.

## 🔐 Security Best Practices

Security is crucial, especially when dealing with APIs. Here’s how this project is configured for security and what you should keep in mind.

### 1. API Key Management (Critical)

- **NEVER hardcode your API key** directly in the source code (`.tsx`, `.ts`, or `.js` files).
- **Use Environment Variables**: The project is set up to load the API key from a `.env.local` file. This file is **excluded from version control** by `.gitignore`, ensuring your key is never pushed to GitHub.
- **Restrict Your API Key**: In your Google AI Studio or Google Cloud dashboard, configure your API key to have restrictions. For web projects, you should restrict it to specific HTTP referrers (your website's domain) to prevent it from being used by unauthorized sites.

### 2. Secure Dependencies

- **Regularly Audit Dependencies**: Malicious packages can be a threat. Periodically run `npm audit` to check for known vulnerabilities in your project's dependencies and apply fixes when available.

    ```bash
    npm audit
    npm audit fix
    ```

### 3. Preventing Cross-Site Scripting (XSS)

- **React's Auto-Escaping**: By default, React escapes content rendered within JSX, which provides strong protection against XSS attacks. Avoid using the `dangerouslySetInnerHTML` prop unless you are certain the content is sanitized.

### 4. Secure Deployment

- **Use HTTPS**: Always deploy your application over HTTPS. This encrypts the traffic between your users and your server, protecting any data in transit and preventing man-in-the-middle attacks. Most modern hosting providers (like Vercel, Netlify, or GitHub Pages) enable this by default.
