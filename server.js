  const express = require("express");
  const multer = require("multer");
  const fs = require("fs");
  const axios = require("axios");
  const FormData = require("form-data");
  const path = require("path");

  const app = express();
  const PORT = 3000;

  // Middleware
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));

  // Multer setup for file upload
  const upload = multer({ dest: "uploads/" });

  // ========================
  // 🏠 Home route
  // ========================
  app.get("/", (req, res) => {
    res.render("index");
  });

  // ========================
  // 🔮 Predict route
  // ========================
  app.post("/predict", upload.single("image"), async (req, res) => {
    try {
      const formData = new FormData();
      formData.append("age", req.body.age);
      formData.append("height", req.body.height);
      formData.append("weight", req.body.weight);
      formData.append("image", fs.createReadStream(req.file.path));

      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: formData.getHeaders(),
      });

      const { result, isMalnourished, dietPlan } = response.data;
      fs.unlinkSync(req.file.path); // delete uploaded temp file

      res.render("result", { result, isMalnourished, dietPlan });
    } catch (error) {
      console.error("❌ Error connecting to Flask:", error.message);
      res.render("result", {
        result: "Could not get prediction. Please try again.",
        isMalnourished: false,
        dietPlan: "Please check your input and retry.",
      });
    }
  });

  // ========================
  // 🚀 Start server
  // ========================
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`✅ Frontend running on http://127.0.0.1:${PORT}`);
  }); 