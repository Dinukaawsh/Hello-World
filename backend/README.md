# Backend Setup Guide

## Overview

This Express backend server acts as a secure proxy for translation API requests, eliminating CORS issues and keeping API keys safe on the server side.

## Features

- ✅ **No CORS Issues**: Backend handles all external API calls
- ✅ **Secure API Keys**: Keys stored server-side, never exposed to frontend
- ✅ **Two Translation Endpoints**:
  - `/api/translate` - DeepL API (high accuracy)
  - `/api/translate/mymemory` - MyMemory API (low accuracy)
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Health Check**: `/api/health` endpoint for monitoring

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your DeepL API key:

```env
DEEPL_API_KEY=your_deepl_api_key_here
PORT=5000
```

Get your DeepL API key from: https://www.deepl.com/pro-api

### 3. Start the Server

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

### DeepL Translation (High Accuracy)

```http
POST /api/translate
Content-Type: application/json

{
  "text": "Hello world",
  "source_lang": "en",
  "target_lang": "es"
}
```

**Response:**

```json
{
  "translation": "Hola mundo",
  "detected_source_language": "EN",
  "raw": { ... }
}
```

### MyMemory Translation (Standard Quality)

```http
POST /api/translate/mymemory
Content-Type: application/json

{
  "text": "Hello world",
  "source_lang": "en",
  "target_lang": "es"
}
```

**Response:**

```json
{
  "translation": "Hola mundo",
  "raw": { ... }
}
```

### Google Translate (Excellent Quality - Free!)

```http
POST /api/translate/google
Content-Type: application/json

{
  "text": "Hello world",
  "source_lang": "en",
  "target_lang": "es"
}
```

**Response:**

```json
{
  "translation": "Hola mundo",
  "detected_source_language": "en",
  "provider": "google",
  "raw": [ ... ]
}
```

### Lingva Translate (Good Quality - Privacy-focused)

```http
POST /api/translate/lingva
Content-Type: application/json

{
  "text": "Hello world",
  "source_lang": "en",
  "target_lang": "es"
}
```

**Response:**

```json
{
  "translation": "Hola mundo",
  "detected_source_language": "en",
  "provider": "lingva",
  "raw": { ... }
}
```

## Testing the Backend

### Using curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Test DeepL translation
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","source_lang":"en","target_lang":"es"}'

# Test MyMemory translation
curl -X POST http://localhost:5000/api/translate/mymemory \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","source_lang":"en","target_lang":"fr"}'

# Test Google Translate (NEW!)
curl -X POST http://localhost:5000/api/translate/google \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","source_lang":"en","target_lang":"es"}'

# Test Lingva Translate (NEW!)
curl -X POST http://localhost:5000/api/translate/lingva \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","source_lang":"en","target_lang":"de"}'
```

## Project Structure

```
backend/
├── server.js           # Main Express server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (not in git)
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Environment Variables

| Variable        | Description                       | Required | Default |
| --------------- | --------------------------------- | -------- | ------- |
| `DEEPL_API_KEY` | Your DeepL API authentication key | Yes      | None    |
| `PORT`          | Server port number                | No       | 5000    |

## Error Handling

The backend provides detailed error messages:

- **400 Bad Request**: Missing required fields (text, target_lang)
- **500 Server Error**: DeepL API key not configured
- **API Errors**: Passes through errors from DeepL/MyMemory APIs

## Security Features

1. **API Key Protection**: Keys stored server-side only
2. **CORS Enabled**: Allows frontend to communicate safely
3. **Input Validation**: Checks for required fields
4. **Error Sanitization**: Doesn't expose sensitive information

## Deployment

### Deploying to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create new app
heroku create your-translator-backend

# Set environment variables
heroku config:set DEEPL_API_KEY=your_api_key_here

# Deploy
git subtree push --prefix backend heroku main
```

### Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from backend directory
cd backend
vercel

# Set environment variables in Vercel dashboard
```

### Deploying to Railway

1. Connect your GitHub repository
2. Set root directory to `backend/`
3. Add environment variable: `DEEPL_API_KEY`
4. Deploy automatically

## Troubleshooting

### "DEEPL_API_KEY is not set" error

**Solution**: Check that `.env` file exists and contains your API key.

### Port already in use

**Solution**: Either stop the other process or change the PORT in `.env`:

```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or use a different port
echo "PORT=5001" >> .env
```

### CORS errors

**Solution**: Make sure CORS is enabled in `server.js` (it is by default).

### Frontend can't connect

**Solution**:

1. Check backend is running: `curl http://localhost:5000/api/health`
2. Check frontend `.env` has correct `REACT_APP_BACKEND_URL`
3. Restart both frontend and backend servers

## Development Tips

- Use `npm run dev` for auto-restart on file changes
- Check console for detailed error logs
- Test endpoints with curl or Postman before testing with frontend
- Keep `.env` secure and never commit it

## Support

For issues or questions:

1. Check this README
2. Check the main project README
3. Verify environment variables are set correctly
4. Check server console logs for detailed errors

---

**Made with ❤️ for secure translation services**
