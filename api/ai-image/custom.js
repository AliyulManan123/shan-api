const fs = require("fs");
const {
  GoogleGenerativeAI: GenerativeModel
} = require("@google/generative-ai");
const axios = require("axios");
const HIJAB_PROMPT = "Modify the character to wear a traditional white hijab as commonly worn by Indonesian Muslim women. Ensure the hijab fully covers the hair, neck, and ears, leaving no hair visible at all. The hijab should appear natural, well-wrapped, and modest, with no part of the original hairstyle showing. Maintain the original face, clothing, and background—only add the fully covering white hijab.";
module.exports = {
  name: "Berhijab/Custom",
  desc: "Ubah karakter menjadi berhijab/custom dengan AI",
  category: "AI Image",
  params: ["url"],
  async run(req, res) {
    const {
      url: imageUrl,
      prompt = HIJAB_PROMPT
    } = req.query;
    if (!imageUrl) {
      return res.status(400).json({
        status: false,
        error: "Parameter url wajib diisi!"
      });
    }
    try {
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });
      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers["content-type"];
      const API_KEYS = ["AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU", "AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M", "AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A", "AIzaSyB1xYZ2YImnBdi2Bh-If_8lj6rvSkabqlA", "AIzaSyB9DzI2olokERvU_oH0ASSO2OKRahleC7U", "AIzaSyDsyj9oOFJK_-bWQFLIR4yY4gpLvq43jd4", "AIzaSyDpqC3y2ZZNlU9O93do36_uijl1HIJ-XKw", "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss"];
      const randomApiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
      const genAI = new GenerativeModel(randomApiKey);
      const modelConfig = {
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {}
      };
      modelConfig.generationConfig.responseModalities = ["Text", "Image"];
      const promptContent = {
        text: prompt
      };
      const result = await genAI.getGenerativeModel(modelConfig).generateContent([promptContent, {
        inlineData: {
          mimeType: contentType,
          data: imageBuffer.toString("base64")
        }
      }]);
      const imagePart = result.response.candidates[0].content.parts.find(part => part.inlineData);
      if (!imagePart) {
        throw new Error("Gagal mendapatkan gambar hasil.");
      }
      const outputImageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(outputImageBuffer);
    } catch (error) {
      console.error(error);
      const errorResponse = {
        status: false,
        error: error.message
      };
      res.status(500).json(errorResponse);
    }
  }
};