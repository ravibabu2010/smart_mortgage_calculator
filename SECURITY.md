
# Application Security Guide

This document outlines key security considerations for the Smart Mortgage Calculator, particularly when moving from a local development environment to a publicly accessible production deployment.

## 1. API Key Management: The Most Critical Risk

**Problem:** The current implementation exposes the Google Gemini API key directly in the client-side JavaScript code (`import.meta.env.VITE_GEMINI_API_KEY`). Anything included in a Vite project is publicly visible in the browser's source files. This is a major security vulnerability. If an attacker finds your key, they can use it for their own purposes, potentially leading to a massive bill and API suspension.

**Solution: Move API Calls to a Secure Backend Proxy**

The **only** secure way to use a private API key is to ensure it never leaves your server. You must create a backend service that acts as a proxy between your React application and the Google Gemini API.

### How it Works:

1.  **Frontend Request:** Your React app does **not** call the Gemini API directly. Instead, it calls an endpoint on your own backend (e.g., `POST /api/get-interest-rates`).
2.  **Backend Processing:**
    -   Your backend server (e.g., a Node.js/Express app, or a serverless function) receives the request.
    -   The backend securely accesses the Gemini API key from its own environment variables (which are never exposed to the public).
    -   The backend makes the actual request to the Google Gemini API.
3.  **Backend Response:** The backend receives the response from Gemini and forwards the necessary data back to your React app.



### Implementation Options:

-   **Serverless Functions:** This is often the easiest and most cost-effective solution for simple proxy needs. Platforms like [Vercel Functions](https://vercel.com/docs/functions), [Netlify Functions](https://docs.netlify.com/functions/overview/), or [Google Cloud Functions](https://cloud.google.com/functions) are excellent choices.
-   **Dedicated Node.js Server:** For more complex applications, you can create a standalone backend using a framework like [Express.js](https://expressjs.com/).

---

## 2. Input Validation

**Never trust user input.** All data coming from the client must be validated on the server before being used.

-   **Client-Side Validation:** The app should continue to have form validation for a good user experience (e.g., ensuring a zip code is 5 digits).
-   **Server-Side Validation (Crucial):** Before your backend proxy sends a zip code to the Gemini API, it must validate that the input is a valid 5-digit string. This prevents malicious or malformed requests from being processed by your server and sent to the third-party API. Libraries like `zod` or `express-validator` are excellent for this.

## 3. Dependency Management

Software dependencies can have vulnerabilities. It's important to keep them in check.

-   **Regular Audits:** Periodically run `npm audit` to check for known vulnerabilities in your project's dependencies.
-   **Automated Updates:** Use a service like [GitHub's Dependabot](https://docs.github.com/en/code-security/dependabot) to automatically create pull requests to update your dependencies when new versions are released.

## 4. Secure Headers

When deploying your site, configure your hosting provider (Vercel, Netlify, etc.) to include security-enhancing HTTP headers in all responses. These headers instruct the browser to enable certain security features.

-   `Content-Security-Policy (CSP)`: Helps prevent Cross-Site Scripting (XSS) attacks.
-   `Strict-Transport-Security (HSTS)`: Enforces the use of HTTPS.
-   `X-Content-Type-Options`: Prevents MIME-sniffing attacks.

Implementing these security measures, especially the backend proxy for your API key, is essential to transform this project from a development demo into a secure, production-ready application.
