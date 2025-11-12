# Translation App

This is a **Translation App** that allows users to translate text between different languages using APIs like **Deepl API** and **MyMemory API**. It provides a simple, user-friendly interface with language selection, text input, and translation results.

## Features

- **Text Translation**: Translates text from one language to another using **Deepl API** (high accuracy) or **MyMemory API** (lower accuracy).
- **Language Selection**: Choose source and target languages from a dropdown list.
- **RTL Language Support**: Detects right-to-left (RTL) languages (like Arabic, Hebrew) and adjusts text direction accordingly.
- **Responsive Design**: Works across different devices and screen sizes.
- View translated text.
- Error handling for invalid inputs or failed API requests.
- Clean and responsive UI built using React and Tailwind CSS.

## Technologies Used

- **Frontend**: React.js
- **Styling**: CSS
- **APIs**:
  - **Deepl API** for high-accuracy translations
  - **MyMemory API** for lower-accuracy translations
- **Proxy Service**: **CORS Anywhere** (for Deepl API requests)

## Architecture

This app uses a **client-server architecture**:

- **Frontend (React)**: User interface running on port 3000
- **Backend (Express)**: API proxy server running on port 5000
  - Handles DeepL API requests (high accuracy)
  - Handles MyMemory API requests (low accuracy)
  - Keeps API keys secure on the server
  - Eliminates CORS issues

## Security

This project uses environment variables to store sensitive API keys. The `.env` file contains your private API keys and should **never** be committed to version control.

### Best Practices:

- ✅ Always use `.env` for sensitive data
- ✅ Keep `.env` in `.gitignore`
- ✅ Share `.env.example` with your team (without real keys)
- ✅ Use different API keys for development and production
- ❌ Never hardcode API keys in your source code
- ❌ Never commit `.env` files to Git
- ❌ Never share your API keys publicly

## Getting Started

To run this app locally, follow the steps below:

### Prerequisites

1. Install **Node.js** and **npm** (Node Package Manager) if you haven't already:
   [Node.js Installation Guide](https://nodejs.org/en/download/)

2. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/Dinukaawsh/translator.git
   ```

3. Navigate to the project directory:

   ```bash
   cd translator
   ```

### Backend Setup (Required)

The app now uses a backend server to handle API requests securely and avoid CORS issues.

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Install backend dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `backend/.env` and add your DeepL API key:

   ```env
   DEEPL_API_KEY=your_deepl_api_key_here
   PORT=5000
   ```

   - Get your free DeepL API key from: [DeepL API](https://www.deepl.com/pro-api)

4. **Start the backend server:**

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

   Keep this terminal open and proceed with frontend setup in a new terminal.

### Frontend Setup

1. **Navigate back to the project root:**

   ```bash
   cd ..
   ```

2. **Install frontend dependencies:**

   ```bash
   npm install
   ```

3. **Configure frontend environment (optional):**

   The frontend is already configured to use `http://localhost:5000` for the backend.
   If you need to change this, create/edit `.env` in the project root:

   ```env
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

4. **Start the frontend development server:**

   ```bash
   npm start
   ```

   The app will open in your default browser at `http://localhost:3000`

### Important Notes

- **Run both servers**: You need to run both the backend (port 5000) and frontend (port 3000) simultaneously
- **Backend first**: Start the backend server before the frontend
- **API keys**: API keys are now stored in the backend only, making your app more secure
- **No CORS issues**: The backend proxy eliminates all CORS problems

## Live Demo

You can access the live demo of the app here:
[Live Demo](https://dinukaawsh.github.io/translator/)

---

## CORS Issues and Proxy Usage for Deepl API

- When using the Deepl API in the app, you may encounter CORS (Cross-Origin Resource Sharing) issues due to restrictions on making API requests directly from the frontend to the Deepl server. To overcome this, we use a CORS proxy.

## What is CORS?

CORS is a security feature in browsers that prevents cross-origin requests from untrusted sources. Since the Deepl API does not allow requests from unapproved domains, your app may face CORS errors when trying to access Deepl from the frontend.

## CORS Anywhere Limitations

To handle CORS issues, we use the CORS Anywhere proxy service. It offers temporary access for free, but there are some important limitations you should be aware of:

- **Temporary Access:** Access to the CORS Anywhere proxy is not permanent. You need to visit the CORS Anywhere demo page and request temporary access each time you first use it or if your session expires. You may also need to do this when using the application from a new device.
- **Rate Limits:** The free tier of CORS Anywhere is rate-limited and may not be suitable for production apps, especially with high traffic or frequent requests. This can lead to slower response times or temporary unavailability.
- **Security Concerns:** Relying on a third-party proxy service like CORS Anywhere may expose your app to potential security risks, and the proxy service could experience downtime or limitations.

## Better Alternatives

- **Own Proxy Server:** A more reliable solution is to set up your own proxy server or backend to handle Deepl API requests. This eliminates the need to rely on third-party services and gives you full control over the requests.
- **Deepl Paid API:** Deepl's paid API offers a more stable, secure, and reliable way to access their translation services without encountering CORS issues.

## Usage in This Application

**In this application, I am using the Deepl API (free version), which causes the CORS issue. However, by requesting temporary access through the CORS Anywhere demo page, you can use this application without encountering any issues.**

## Important Notes:

- **Keep in mind that CORS Anywhere's free tier has limitations. If you experience any interruptions or issues, it's due to these restrictions.**
- **For a more stable experience, consider using Deepl's paid API or setting up your own proxy server.**
