const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./uploads")); // Save files to ./uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route for handling image predictions (DL)
app.post("/predictdl", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "./uploads", req.file.filename);

  try {
    const flaskResponse = await axios.post("http://localhost:5000/predictdl", {
      file: fs.createReadStream(filePath),
    });
    res.status(200).json(flaskResponse.data);
  } catch (error) {
    console.error("Error from Flask:", error);
    res.status(500).json({ error: "Error processing image" });
  }
});

// Route for handling image predictions (LLM)
app.post("/predictllm", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "./uploads", req.file.filename);

  try {
    const flaskResponse = await axios.post("http://localhost:5000/predictllm", {
      file: fs.createReadStream(filePath),
    });
    res.status(200).json(flaskResponse.data);
  } catch (error) {
    console.error("Error from Flask:", error);
    res.status(500).json({ error: "Error processing image" });
  }
});

const PORT = 5001; // Adjust as necessary
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
