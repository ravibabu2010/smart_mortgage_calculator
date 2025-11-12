
# How to Use This Project with an AI IDE

AI-powered IDEs and chat interfaces (like Google AI Studio, ChatGPT, GitHub Copilot Chat, etc.) are powerful tools for code generation, debugging, and refactoring. Since they don't typically clone a whole repository, you need to provide the code as context. Here's a detailed guide on how to do that effectively with this project.

## The Workflow: Local Repo as the Source of Truth

Your local Git repository is your permanent, reliable source of truth. The AI IDE is a powerful, temporary environment you use to modify that code. The process involves manually syncing files between your local project and the AI.

**Local Machine <-> Copy/Paste <-> AI IDE**

---

### Step-by-Step Instructions

1.  **Start a Clean Session:**
    Begin a new session or conversation with your AI tool. It's crucial to start fresh to avoid context from previous, unrelated conversations.

2.  **Set the Context (Initial Prompt):**
    Tell the AI what its role is and what you're about to provide. This primes the AI to give you better, more relevant answers.

    **Example Initial Prompt:**
    > "Act as a world-class senior frontend engineer with deep expertise in React, TypeScript, and the Google Gemini API. I am going to provide you with the full code for several files from my mortgage calculator application. I want you to understand the project structure and logic so you can help me add new features and fix bugs. Do not suggest any code changes until I ask. Just acknowledge that you have received and understood the files."

3.  **Provide the File Contents:**
    Copy the entire content of each *relevant* file and paste it into the chat. It's critical to use clear delimiters so the AI can distinguish between files.

    **Tips for Providing Files:**
    -   **Be Selective:** You don't need to provide every single file for every request. If you're changing the amortization table, you probably only need `App.tsx`, `components/AmortizationTable.tsx`, `hooks/useMortgageCalculator.ts`, and `types/index.ts`. Giving too many files can confuse the AI.
    -   **Use Clear Markers:** Use a consistent format to separate files.

    **Example of Pasting Files:**

    ````
    --- START OF FILE src/App.tsx ---
    ```tsx
    // Paste the full content of App.tsx here
    ```
    --- END OF FILE src/App.tsx ---

    --- START OF FILE src/hooks/useMortgageCalculator.ts ---
    ```ts
    // Paste the full content of useMortgageCalculator.ts here
    ```
    --- END OF FILE src/hooks/useMortgageCalculator.ts ---

    --- START OF FILE src/types/index.ts ---
    ```ts
    // Paste the full content of types/index.ts here
    ```
    --- END OF FILE src/types/index.ts ---
    ````

4.  **Make Your Request:**
    Once the AI has the context, make your request clearly and specifically.

    **Example Good Request:**
    > "Great. Now, please modify the `AmortizationTable` component. I want to add a new column that shows the cumulative principal paid after each payment."

    **Example Bad Request:**
    > "Change the table."

5.  **Apply the AI's Changes:**
    The AI will provide you with updated code blocks.
    -   Carefully copy the new code for each modified file.
    -   Paste it back into the corresponding file in your local project, replacing the old code.
    -   Review the changes. The AI is a tool, not an infallible oracle. Make sure the changes make sense and work as expected.

6.  **Test and Commit:**
    -   Run your application locally (`npm run dev`) to test the changes.
    -   Once you're satisfied, commit the changes to your Git repository with a clear commit message.

    ```sh
    git add .
    git commit -m "feat: Add cumulative principal to amortization table"
    git push
    ```

This disciplined workflow allows you to leverage the speed of AI-assisted development while maintaining the integrity and history of a professional, version-controlled project.
