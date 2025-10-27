# OAuth Setup Instructions

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Set application type to "Web application"
7. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
8. Copy the Client ID and Client Secret

## X (Twitter) OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or use an existing one
3. Go to "App Settings" → "Authentication settings"
4. Enable OAuth 2.0
5. Add callback URL: `http://localhost:3000/api/auth/x/callback`
6. Copy the Client ID and Client Secret

## Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# X (Twitter) OAuth
X_CLIENT_ID=your_x_client_id_here
X_CLIENT_SECRET=your_x_client_secret_here
X_REDIRECT_URI=http://localhost:3000/api/auth/x/callback

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing OAuth

1. Start the development server: `npm run dev`
2. Go to `/signup` or `/signin`
3. Click on "Google" or "X" buttons
4. You should be redirected to the respective OAuth provider
5. After authentication, you'll be redirected back to the dashboard

## Production Setup

For production, update the redirect URIs to your production domain:
- Google: `https://yourdomain.com/api/auth/google/callback`
- X: `https://yourdomain.com/api/auth/x/callback`
- App URL: `https://yourdomain.com`
