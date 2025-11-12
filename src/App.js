import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./App.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { languages, targetLanguages, getTextDirection } from "./languageData";

function App() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState("");
  const [sourceLang, setSourceLang] = useState("auto"); // Default to "auto" for language detection
  const [targetLang, setTargetLang] = useState("en"); // Default to english
  const [textDirection, setTextDirection] = useState("ltr"); // Default to LTR
  const [translationModel, setTranslationModel] = useState("google"); // Default to google (free and good quality)
  const [animationClass, setAnimationClass] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Debounce function to delay translation
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleTranslate = useCallback(
    async (textToTranslate) => {
      if (!textToTranslate.trim()) {
        setTranslation("");
        setError("");
        return;
      }

      if (sourceLang === targetLang) {
        setError("Source and target languages cannot be the same.");
        setTranslation("");
        return;
      }

      setError("");
      setIsTranslating(true);

      // Set text direction based on target language using helper function
      const direction = getTextDirection(targetLang);
      setTextDirection(direction);

    try {
      let translationResult;
      let apiUrl;
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

      if (translationModel === "deepl") {
        // DeepL - Premium (Best quality)
        apiUrl = `${backendUrl}/api/translate`;

        const requestBody = {
          text: textToTranslate,
          source_lang: sourceLang === "auto" ? "auto" : sourceLang,
          target_lang: targetLang,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Failed to fetch translation from DeepL."
          );
        }

        const data = await response.json();
        translationResult = data.translation || "No translation found.";
      } else if (translationModel === "google") {
        // Google Translate - Excellent quality, free
        apiUrl = `${backendUrl}/api/translate/google`;

        const requestBody = {
          text: textToTranslate,
          source_lang: sourceLang === "auto" ? "auto" : sourceLang,
          target_lang: targetLang,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch translation from Google.");
        }

        const data = await response.json();
        translationResult = data.translation || "No translation found.";
      } else if (translationModel === "lingva") {
        // Lingva - Good quality, privacy-focused
        apiUrl = `${backendUrl}/api/translate/lingva`;

        const requestBody = {
          text: textToTranslate,
          source_lang: sourceLang === "auto" ? "auto" : sourceLang,
          target_lang: targetLang,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch translation from Lingva.");
        }

        const data = await response.json();
        translationResult = data.translation || "No translation found.";
      } else {
        // MyMemory - Standard (Basic quality)
        apiUrl = `${backendUrl}/api/translate/mymemory`;

        const requestBody = {
          text: textToTranslate,
          source_lang: sourceLang,
          target_lang: targetLang,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch translation from MyMemory.");
        }

        const data = await response.json();
        translationResult = data.translation || "No translation found.";
      }

        setTranslation(translationResult);
        setIsTranslating(false);
      } catch (err) {
        setError("Failed to fetch translation. Please try again.");
        setIsTranslating(false);
        console.error(err);
      }
    },
    [sourceLang, targetLang, translationModel]
  );

  // Debounced translation function (waits 800ms after user stops typing)
  const debouncedTranslate = useCallback(
    debounce((textToTranslate) => {
      handleTranslate(textToTranslate);
    }, 800),
    [handleTranslate]
  );

  // Auto-translate when text changes
  useEffect(() => {
    debouncedTranslate(text);
  }, [text, debouncedTranslate]);

  // Re-translate when languages or model changes
  useEffect(() => {
    if (text.trim()) {
      handleTranslate(text);
    }
  }, [sourceLang, targetLang, translationModel]);

  // Handle translation model change - auto-detect not supported in Standard mode
  useEffect(() => {
    if (translationModel === "mymemory" && sourceLang === "auto") {
      setSourceLang("en"); // Default to English for MyMemory (Standard mode)
    }
  }, [translationModel, sourceLang]);

  const handleSwapLanguages = () => {
    // Swap the source and target languages
    const tempSourceLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempSourceLang);

    // Set text direction for the new target language
    const direction = getTextDirection(tempSourceLang);
    setTextDirection(direction);

    // Add animation class to trigger animation
    setAnimationClass("animate-arrow");

    // Reset the animation class after the animation duration
    setTimeout(() => {
      setAnimationClass("");
    }, 300); // Adjust timing as needed
  };

  // Create component for rendering language options
  const renderLanguageOptions = (includeAuto = false) => {
    const langsToRender = includeAuto ? languages : targetLanguages;

    return langsToRender.map((lang) => {
      // Disable auto-detect option when MyMemory (Standard) mode is selected
      const isDisabled = lang.code === "auto" && translationModel === "mymemory";

      return (
        <option key={lang.code} value={lang.code} disabled={isDisabled}>
          {lang.flag} {lang.nativeName}
          {isDisabled ? " (Not available)" : ""}
        </option>
      );
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
      <div
        className="card shadow-lg p-4 rounded-lg"
        style={{ maxWidth: "900px", width: "90%" }}
      >
        <div className="text-center mb-4 position-relative">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-outline-secondary btn-sm position-absolute top-0 end-0"
            style={{ borderRadius: "50%", width: "40px", height: "40px" }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <i className={`fa ${isDarkMode ? "fa-sun-o" : "fa-moon-o"}`}></i>
          </button>

          <h1
            className="text-primary d-flex justify-content-center align-items-center gap-2"
            style={{ fontSize: "2.5rem", fontWeight: "bold" }}
          >
            <i className="fa fa-globe"></i> hello-World
          </h1>
          <p className="text-muted">Instant translation as you type</p>
        </div>

        {/* Translation Model and Language Controls */}
        <div className="row mb-3 align-items-center">
          <div className="col-md-4 mb-3 mb-md-0">
            <label
              className="form-label text-dark mb-2"
              style={{ fontSize: "0.9rem" }}
            >
              <i className="fa fa-cog me-2"></i>Translation Mode
            </label>
            <div className="dropdown">
              <button
                className="btn btn-outline-primary dropdown-toggle w-100"
                type="button"
                id="translationModelDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {translationModel === "mymemory" && "Standard (Fast)"}
                {translationModel === "google" && "Google (Free) ⭐"}
                {translationModel === "lingva" && "Lingva (Private)"}
                {translationModel === "deepl" && "DeepL (Premium)"}
              </button>
              <ul
                className="dropdown-menu w-100"
                aria-labelledby="translationModelDropdown"
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setTranslationModel("mymemory")}
                  >
                    <i className="fa fa-bolt me-2"></i>Standard (Fast)
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setTranslationModel("google")}
                  >
                    <i className="fa fa-google me-2"></i>Google (Free) ⭐
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setTranslationModel("lingva")}
                  >
                    <i className="fa fa-shield me-2"></i>Lingva (Private)
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setTranslationModel("deepl")}
                  >
                    <i className="fa fa-star me-2"></i>DeepL (Premium)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-4 mb-3 mb-md-0">
            <label
              className="form-label text-dark mb-2"
              style={{ fontSize: "0.9rem" }}
            >
              <i className="fa fa-flag me-2"></i>From
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="form-select custom-scrollbar custom-language-select"
            >
              {renderLanguageOptions(true)}
            </select>
          </div>

          <div className="col-md-4">
            <label
              className="form-label text-dark mb-2"
              style={{ fontSize: "0.9rem" }}
            >
              <i className="fa fa-flag-checkered me-2"></i>To
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="form-select custom-scrollbar custom-language-select"
            >
              {renderLanguageOptions(false)}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="text-center mb-3">
          <button
            onClick={handleSwapLanguages}
            className="btn btn-sm btn-outline-secondary"
            title="Swap languages"
          >
            <i className={`fa fa-exchange ${animationClass}`}></i>
          </button>
        </div>

        {/* Text Input */}
        <div className="mb-3">
          <label className="form-label text-dark">
            <i className="fa fa-pencil me-2"></i>Enter text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing to translate..."
            className="form-control form-control-lg"
            rows="5"
            dir={textDirection}
            style={{
              fontSize: "1.1rem",
              resize: "vertical",
            }}
          />
          <small className="text-muted">
            <i className="fa fa-info-circle me-1"></i>
            Translation happens automatically as you type
          </small>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center"
            role="alert"
          >
            <i className="fa fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Translation Output */}
        <div className="mt-3">
          <label className="form-label text-dark">
            <i className="fa fa-language me-2"></i>Translation
            {isTranslating && (
              <span className="ms-2">
                <span
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Translating...</span>
                </span>
                <small className="ms-2 text-muted">Translating...</small>
              </span>
            )}
          </label>
          <div
            className="p-4 bg-light border rounded"
            style={{ minHeight: "150px" }}
          >
            <p
              dir={textDirection}
              style={{
                fontSize: "1.1rem",
                margin: 0,
                color: translation ? "#212529" : "#6c757d",
              }}
            >
              {translation ||
                (text
                  ? isTranslating
                    ? "Translating..."
                    : "Translation will appear here..."
                  : "Your translation will appear here...")}
            </p>
          </div>
        </div>

        {/* Character Count */}
        <div className="text-end mt-2">
          <small className="text-muted">{text.length} characters</small>
        </div>
      </div>
    </div>
  );
}

export default App;
