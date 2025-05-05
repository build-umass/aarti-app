# Authentication System README

## Overview

This document outlines the authentication system implemented in this Next.js (App Router) admin application. The system uses JSON Web Tokens (JWT) stored in secure cookies to manage user sessions and protect specific routes (`/quizzes`, `/resources`). It employs server-side password verification using `bcrypt` for enhanced security. There is a single admin user, authenticated via a password stored securely as a hash.

## Technologies Used

*   **Next.js:** React framework with App Router conventions.
*   **React:** Frontend library for building the UI.
*   **TypeScript:** For static typing and improved developer experience.
*   **jose:** A robust library for generating and verifying JWTs, compatible with Node.js and Edge Runtimes (used in Middleware).
*   **bcrypt:** Library for securely hashing and comparing passwords.
*   **next/headers:** Next.js utility for accessing cookies in Server Components and Route Handlers.
*   **Next.js Middleware:** Used to intercept requests and protect routes based on authentication status.
*   **Tailwind CSS / Shadcn UI:** (Implied) For styling and UI components.

## Setup & Configuration

1.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
    Ensure `jose`, `bcrypt`, `@types/bcrypt` are installed.

2.  **Environment Variables (`.env.local`):**
    Create a `.env.local` file in the project root. This file should **not** be committed to version control.

    *   **`JWT_SECRET`**:
        *   **Purpose:** A secret key used by `jose` to sign and verify JWTs. It must be kept confidential.
        *   **Action:** Generate a strong, random string (e.g., using a password manager or online generator) and set it as the value.
        *   **Example:** `JWT_SECRET="your_super_secret_random_string_here_32_chars_or_more"`

    *   **`ADMIN_PASSWORD_HASH`**:
        *   **Purpose:** Stores the securely hashed version of the admin password. We **never** store the plain text password.
        *   **Action:**
            1.  Use the provided script `scripts/hash-password.js` to generate the hash for your desired admin password.
                ```bash
                node scripts/hash-password.js
                ```
            2.  Copy the entire hash output (starting with `$2b$...`).
            3.  Paste the hash into `.env.local`. **Crucially, due to how environment variable parsers might handle `$` characters, you must quote the value AND escape the dollar signs (`\$`) within the quotes.**
        *   **Example (Replace hash with your generated one):**
            ```.env.local
            ADMIN_PASSWORD_HASH="\$2b\$10\$aYSsWC7hFBMXP3oHUZwJL.YpRwIDBOwKlJPEuTYY8ZsB3dBxekEqC"
            ```

3.  **Restart Server:** After creating or modifying `.env.local`, always restart your Next.js development server (`npm run dev` or `yarn dev`) for the changes to take effect.

## Authentication Flow

The process involves several steps from login to accessing protected content and logging out:

1.  **Login Attempt:**
    *   The user navigates to the `/signin` page.
    *   The `SignInForm` component (`components/SignInForm.tsx`) captures the password input.
    *   On form submission, the component sends a `POST` request to the `/api/login` endpoint with the entered password in the request body.

2.  **Password Verification (Server-Side):**
    *   The Login API Route (`app/api/login/route.ts`) receives the request.
    *   It retrieves the `ADMIN_PASSWORD_HASH` from environment variables (`process.env`), ensuring to `.trim()` any potential whitespace.
    *   It uses `bcrypt.compare(submittedPassword, storedHash)` to securely compare the submitted password against the stored hash. This comparison is computationally intensive by design, protecting against timing attacks.

3.  **JWT Generation:**
    *   If `bcrypt.compare` returns `true` (passwords match):
        *   A payload object is created containing essential user information (e.g., `{ sub: 'admin_user', role: 'admin' }`). The `sub` (subject) uniquely identifies the user.
        *   The `encodeToken` function (`lib/auth.ts`) uses the `jose` library and the `JWT_SECRET` to create a signed JWT.
        *   The JWT includes standard claims like `iat` (issued at) and `exp` (expiration time - typically set for 1 hour in this implementation), along with the custom payload.

4.  **Cookie Setting:**
    *   The Login API Route configures a secure cookie named `auth_token`.
    *   Using the `NextResponse` object pattern (`response.cookies.set(...)`):
        *   **`value`**: The generated JWT string.
        *   **`httpOnly: true`**: Prevents the cookie from being accessed via client-side JavaScript (mitigates XSS attacks).
        *   **`secure: process.env.NODE_ENV === 'production'`**: Ensures the cookie is only sent over HTTPS in production.
        *   **`path: '/'`**: Makes the cookie accessible across the entire site.
        *   **`sameSite: 'strict'`**: Helps protect against Cross-Site Request Forgery (CSRF) attacks by ensuring the cookie is only sent for same-site requests.
        *   **`maxAge: 3600`**: Sets the cookie's lifetime (in seconds) to match the JWT expiration (1 hour).
    *   The API route returns a successful JSON response (`{ success: true }`) with the `Set-Cookie` header attached.

5.  **Redirection and UI Update:**
    *   The `SignInForm` component receives the successful response.
    *   It calls `router.push('/quizzes')` (or another protected route) to navigate the user.
    *   **Crucially**, it then calls `router.refresh()`. This triggers Next.js to re-fetch data for Server Components for the current route.
    *   The `RootLayout` (`app/layout.tsx`), being a Server Component, re-renders. It uses `cookies()` from `next/headers` to read the `auth_token` cookie (which is now present in the browser's storage and sent with the request triggered by `refresh`).
    *   The layout determines `isSignedIn = true` and passes this prop to the `Header` component (`components/Header.tsx`).
    *   The `Header` component re-renders, now displaying the "Sign Out" button.

6.  **Accessing Protected Routes:**
    *   When the user navigates to `/quizzes` or `/resources` (or any path matched by the middleware config):
        *   The Next.js Middleware (`middleware.ts`) intercepts the request *before* it reaches the page component.
        *   It attempts to read the `auth_token` cookie from the incoming request (`request.cookies.get('auth_token')`).
        *   If the cookie is missing, the middleware immediately redirects the user to `/signin`.
        *   If the cookie exists, the `decodeToken` function (`lib/auth.ts`) uses `jose` and the `JWT_SECRET` to:
            *   Verify the JWT's signature.
            *   Check if the JWT has expired (`exp` claim).
            *   Decode the payload.
        *   If the JWT is valid (signature okay, not expired), `decodeToken` returns the payload. The middleware then calls `NextResponse.next()`, allowing the request to proceed to the requested page (`/quizzes` or `/resources`).
        *   If the JWT is invalid (bad signature, expired, malformed), `decodeToken` returns `null`. The middleware redirects the user to `/signin` and attempts to clear the invalid cookie.

7.  **Logout Process:**
    *   The user clicks the "Sign Out" button in the `Header` component.
    *   The `handleSignOut` function in the `Header` sends a `POST` request to `/api/logout`.
    *   The Logout API Route (`app/api/logout/route.ts`) receives the request.
    *   It uses `response.cookies.set(...)` (or `cookies().delete()`) to clear the `auth_token` cookie. This is typically done by setting the cookie's `maxAge` to `0` or its `expires` date to a time in the past. The `path` must match the original path (`'/'`).
    *   The API route returns a successful JSON response.
    *   The `Header` component receives the success response, calls `router.push('/signin')` to redirect, and `router.refresh()` to update the server state (layout/header will now show "Sign In").

## Security Considerations

*   **Password Hashing:** Plain text passwords are **never** stored. `bcrypt` is used for one-way hashing, making it computationally infeasible to reverse the hash back to the original password.
*   **JWT Secret:** The `JWT_SECRET` must be kept confidential and should be a cryptographically strong random string. Compromise of this secret allows anyone to forge valid JWTs.
*   **HttpOnly Cookies:** Prevents client-side scripts from accessing the JWT, mitigating the risk of token theft via XSS.
*   **Secure Cookies:** Ensures the JWT cookie is only transmitted over HTTPS, preventing eavesdropping on insecure connections.
*   **SameSite=Strict Cookies:** Provides strong protection against CSRF attacks.
*   **JWT Expiration:** Setting an expiration time (`exp` claim) limits the window during which a potentially compromised JWT can be used.
*   **Server-Side Validation:** All critical authentication logic (password comparison, JWT verification) happens on the server (API Routes, Middleware), not trusting the client.
*   **Middleware Protection:** Acts as a gatekeeper for protected routes, ensuring only authenticated users can access them.

## Key File Locations

*   `.env.local`: Environment variables (root)
*   `scripts/hash-password.js`: Script to generate password hash (`scripts/`)
*   `lib/auth.ts`: JWT encoding/decoding functions (`lib/`)
*   `lib/types.ts`: Shared TypeScript types (`lib/`)
*   `middleware.ts`: Route protection logic (root or `src/`)
*   `app/layout.tsx`: Root layout, reads cookie for header state (`app/`)
*   `components/Header.tsx`: Displays login/logout button (`components/`)
*   `app/signin/page.tsx`: Login page route (`app/signin/`)
*   `components/SignInForm.tsx`: Login form component (`components/`)
*   `app/api/login/route.ts`: Login API endpoint (`app/api/login/`)
*   `app/api/logout/route.ts`: Logout API endpoint (`app/api/logout/`)
