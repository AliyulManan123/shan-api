const fs = require("fs");
const {
  GoogleGenerativeAI
} = require("@google/generative-ai");
const axios = require("axios");
const prompt = "Transform the face of the character in the image into a pig-like appearance. Replace the mouth and nose with a realistic pig's snout. Slightly adjust the skin tone to a soft brown shade. Maintain the original style and quality of the image, but ensure the facial features distinctly resemble a pig while keeping the rest of the body and setting unchanged.";
module.exports = {
  name: "Jadibabi",
  desc: "Ubah wajah jadi babi dengan AI",
  category: "AI Image",
  params: ["url"],
  async run(req, res) {
    const {
      url
    } = req.query;
    if (!url) return res.status(400).json({
      status: false,
      error: "Parameter url wajib diisi!"
    });
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer"
      });
      const buffer = Buffer.from(response.data);
      const mime = response.headers["content-type"];
      const apiKeys = ["AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU", "AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M", "AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A", "AIzaSyB1xYZ2YImnBdi2Bh-If_8lj6rvSkabqlA", "AIzaSyB9DzI2olokERvU_oH0ASSO2OKRahleC7U", "AIzaSyDsyj9oOFJK_-bWQFLIR4yY4gpLvq43jd4", "AIzaSyDpqC3y2ZZNlU9O93do36_uijl1HIJ-XKw", "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss"];
      const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
      const genAI = new GoogleGenerativeAI(apiKey);
      const result = await genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["Text", "Image"]
        }
      }).generateContent([{
        text: prompt
      }, {
        inlineData: {
          mimeType: mime,
          data: buffer.toString("base64")
        }
      }]);
      const part = result.response.candidates[0].content.parts.find(p => p.inlineData);
      if (!part) throw new Error("Gagal mendapatkan gambar hasil.");
      const finalBuffer = Buffer.from(part.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(finalBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  }
};