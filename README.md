# Vireact - React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Google One-Tap Authentication

This application includes Google One-Tap authentication functionality using Google's official Identity Services library.

### Setup

1. **Environment Variables**: Add the following to your `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_BACKEND_URL=http://localhost:5000
   VITE_FRONTEND_URL=http://localhost:5173
   ```

2. **Google Cloud Console**: 
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Identity API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/v1/auth/google/callback` (development)
     - `https://yourdomain.com/api/v1/auth/google/callback` (production)

### Features

- **Google One-Tap Login**: Seamless authentication with Google's One-Tap prompt
- **OAuth Callback Handling**: Automatic handling of Google OAuth callbacks
- **Backend Integration**: Uses Axios to communicate with your backend OAuth endpoints
- **Redux Integration**: User authentication state managed through Redux
- **Persistent Sessions**: Authentication state persisted in localStorage
- **Fallback Login**: Alternative Google OAuth flow for browsers that don't support One-Tap

### Components

- `GoogleOneTap`: Main component for Google One-Tap authentication
- `GoogleCallback`: Handles OAuth callback from Google
- Updated `Login` page with integrated Google authentication

### Usage

The Google One-Tap component automatically initializes when the login page loads. Users can:
1. Use the One-Tap prompt for instant authentication
2. Use the "Continue with Google" button as a fallback
3. Be automatically redirected to the dashboard upon successful authentication

### Backend Integration

The frontend integrates with your backend's OAuth endpoints:
- `GET /api/v1/auth/google` - Initiates Google OAuth flow
- `GET /api/v1/auth/google/callback` - Handles OAuth callback
- `GET /api/v1/auth/me` - Checks authentication status (optional)

The GoogleCallback component handles the OAuth flow and updates the Redux state with user data returned from your backend.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
