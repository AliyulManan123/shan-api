const axios = require("axios");
const path = require("path");
module.exports = {
  name: "Trap",
  desc: "Random NSFW trap from waifu.pics",
  category: "NSFW",
  async run(req, res) {
    try {
      const {
        data
      } = await axios.get("https://api.waifu.pics/nsfw/trap");
      const ext = path.extname(data.url).toLowerCase();
      const file = await axios.get(data.url, {
        responseType: "arraybuffer"
      });
      const contentType = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".mp4": "video/mp4"
      } [ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.send(file.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  }
};