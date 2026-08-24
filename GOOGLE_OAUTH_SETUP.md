# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for CampVenture.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "CampVenture")
5. Click "Create"

### 2. Enable Google+ API

1. In your project dashboard, click on "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and then click "Enable"

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (for testing)
   - Fill in the required fields (App name, user support email, developer email)
   - Add scopes: `userinfo.email` and `userinfo.profile`
   - Add test users if needed
4. Select "Web application" as the application type
5. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
6. Click "Create"
7. Copy the Client ID and Client Secret

### 4. Configure Environment Variables

1. Copy `config/config.env.example` to `config/config.env`
2. Update the following variables:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```
3. For production, update the callback URL to your production domain

### 5. Test the Integration

1. Start your application: `npm start` or `npm run dev`
2. Navigate to the login page
3. Click "Sign in with Google"
4. You should be redirected to Google's authentication page
5. After successful authentication, you'll be redirected back to your application

## Security Notes

- Never commit your `config/config.env` file to version control
- Keep your Client Secret secure
- Use environment variables in production
- Regularly rotate your credentials
- Use HTTPS in production

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in your Google Cloud Console exactly matches the one in your config
- Check that you're using the correct protocol (http vs https)

### "Access blocked: This app's request is invalid" error
- Verify that the OAuth consent screen is properly configured
- Make sure you've added the necessary scopes
- Check that the user email is added as a test user (if in testing mode)

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
