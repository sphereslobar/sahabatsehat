# Deployment Guide - Sahabat Sehat Recruitment App

## Overview
This guide will help you deploy and configure the Sahabat Sehat recruitment verification application.

## Prerequisites
- Google Cloud Console account
- Google Drive account
- Web server or hosting platform

## Google APIs Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API

### 2. Creating API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key and update `CONFIG.GOOGLE_SHEETS.API_KEY` in `config.js`

### 3. Creating OAuth 2.0 Client ID (Required for File Upload)

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add your domain to "Authorized JavaScript origins":
   - For local development: `http://localhost:8000`
   - For production: `https://yourdomain.com`
5. Add redirect URIs if needed
6. Copy the Client ID and update `CONFIG.GOOGLE_OAUTH2.CLIENT_ID` in `config.js`

**Important:** This app uses Google Identity Services (GIS), the modern replacement for the deprecated `gapi.auth2` library. Make sure your OAuth2 client is properly configured for JavaScript origins.

### 4. Google Drive Folder Setup

1. Create a folder in Google Drive for file uploads
2. Right-click the folder > "Share" > "Anyone with the link can view"
3. Copy the folder ID from the URL (the part after `/folders/`)
4. Update `CONFIG.GOOGLE_DRIVE.FOLDER_ID` in `config.js`

### 5. Google Sheets Setup

1. Create or open your Google Sheets document
2. Make sure it has a sheet named "Reviewed" (or update `CONFIG.GOOGLE_SHEETS.SHEET_NAME`)
3. Copy the spreadsheet ID from the URL
4. Update `CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID` in `config.js`
5. Share the sheet with "Anyone with the link can edit"

## Configuration File Updates

Update the following values in `config.js`:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        API_KEY: 'YOUR_ACTUAL_API_KEY',
        SPREADSHEET_ID: 'YOUR_ACTUAL_SPREADSHEET_ID',
        // ... other settings
    },
    GOOGLE_OAUTH2: {
        CLIENT_ID: 'YOUR_ACTUAL_OAUTH2_CLIENT_ID',
        // ... other settings
    },
    GOOGLE_DRIVE: {
        FOLDER_ID: 'YOUR_ACTUAL_DRIVE_FOLDER_ID'
    }
    // ... other settings
};
```

## Troubleshooting

### File Upload Issues

If you're getting OAuth2 authentication errors:
1. Verify OAuth2 Client ID is correctly configured
2. Make sure your domain is added to authorized origins
3. Check that Google Drive API is enabled
4. Ensure the Drive folder exists and is shared properly

### Common Error Messages

- "OAuth2 Client ID not configured" - Update the CLIENT_ID in config.js
- "OAuth2 not initialized" - Check that the Google APIs are loading correctly
- "Authentication error" - Verify OAuth2 settings and enabled APIs
- "Google Identity Services belum tersedia" - Refresh the page and wait for libraries to load
- "idpiframe_initialization_failed" - This indicates you're using deprecated libraries; the app now uses Google Identity Services

### Google Identity Services Migration

This app uses the modern Google Identity Services (GIS) library instead of the deprecated `gapi.auth2`. If you encounter authentication errors:

1. **Clear browser cache** - Old cached scripts may cause conflicts
2. **Check OAuth2 configuration** - Ensure JavaScript origins are properly set
3. **Verify script loading** - The Google Identity Services script loads asynchronously
4. **Test in incognito mode** - This helps identify caching issues

## Local Development

1. Serve the files using a local web server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

2. Access the app at `http://localhost:8000`

## Production Deployment

1. Upload all files to your web server
2. Update OAuth2 authorized origins with your production domain
3. Test all functionality before going live

## Security Notes

- Never commit API keys or credentials to version control
- Use environment variables for sensitive configuration in production
- Regularly rotate API keys and OAuth2 credentials
- Consider implementing additional authentication layers for production use 