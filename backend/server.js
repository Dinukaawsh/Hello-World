const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// DeepL translation endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { text, source_lang, target_lang } = req.body;

    // Validate request
    if (!text || !target_lang) {
      return res.status(400).json({
        error: "Missing required fields: text and target_lang are required",
      });
    }

    // Check if API key is configured
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Server configuration error: DEEPL_API_KEY is not set",
      });
    }

    // Prepare request to DeepL API
    const requestBody = {
      text: Array.isArray(text) ? text : [text],
      source_lang:
        source_lang === "auto" ? undefined : source_lang?.toUpperCase(),
      target_lang: target_lang.toUpperCase(),
    };

    // Remove undefined fields
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key]
    );

    // Call DeepL API
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepL API Error:", response.status, errorData);

      return res.status(response.status).json({
        error: "Failed to fetch translation from DeepL",
        details: errorData,
      });
    }

    // Parse and return the translation
    const data = await response.json();
    res.json({
      translation: data.translations[0].text,
      detected_source_language: data.translations[0].detected_source_language,
      raw: data,
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Google Translate endpoint (unofficial, free)
app.post("/api/translate/google", async (req, res) => {
  try {
    const { text, source_lang, target_lang } = req.body;

    // Validate request
    if (!text || !target_lang) {
      return res.status(400).json({
        error: "Missing required fields: text and target_lang are required",
      });
    }

    // Use Google Translate unofficial API
    const sourceLangCode = source_lang === "auto" ? "auto" : source_lang;
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLangCode}&tl=${target_lang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch translation from Google Translate",
      });
    }

    const data = await response.json();

    // Parse Google Translate response format
    let translatedText = "";
    if (data && data[0]) {
      data[0].forEach((item) => {
        if (item[0]) {
          translatedText += item[0];
        }
      });
    }

    // Detect source language if auto
    const detectedLang = data[2] || source_lang;

    res.json({
      translation: translatedText || "No translation found",
      detected_source_language: detectedLang,
      provider: "google",
      raw: data,
    });
  } catch (error) {
    console.error("Google translation error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Lingva Translate endpoint (privacy-focused, free)
app.post("/api/translate/lingva", async (req, res) => {
  try {
    const { text, source_lang, target_lang } = req.body;

    // Validate request
    if (!text || !target_lang) {
      return res.status(400).json({
        error: "Missing required fields: text and target_lang are required",
      });
    }

    const sourceLangCode = source_lang === "auto" ? "auto" : source_lang;
    const apiUrl = `https://lingva.ml/api/v1/${sourceLangCode}/${target_lang}/${encodeURIComponent(
      text
    )}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch translation from Lingva",
      });
    }

    const data = await response.json();

    res.json({
      translation: data.translation || "No translation found",
      detected_source_language: data.info?.detectedSource || source_lang,
      provider: "lingva",
      raw: data,
    });
  } catch (error) {
    console.error("Lingva translation error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// MyMemory translation endpoint (for low accuracy mode)
app.post("/api/translate/mymemory", async (req, res) => {
  try {
    const { text, source_lang, target_lang } = req.body;

    // Validate request
    if (!text || !target_lang) {
      return res.status(400).json({
        error: "Missing required fields: text and target_lang are required",
      });
    }

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${source_lang || "auto"}|${target_lang}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch translation from MyMemory",
      });
    }

    const data = await response.json();
    res.json({
      translation: data?.responseData?.translatedText || "No translation found",
      raw: data,
    });
  } catch (error) {
    console.error("MyMemory translation error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║              🚀 Translation Backend Server Running                   ║
╚══════════════════════════════════════════════════════════════════════╝

  Server: http://localhost:${PORT}
  Health: http://localhost:${PORT}/api/health

  Endpoints:
  - POST /api/translate          (DeepL - High accuracy)
  - POST /api/translate/mymemory (MyMemory - Low accuracy)

  Environment:
  - DeepL API Key: ${process.env.DEEPL_API_KEY ? "✓ Configured" : "✗ Missing"}

  Press Ctrl+C to stop the server
  `);
});
