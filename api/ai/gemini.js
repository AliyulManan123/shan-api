/**
 * Shan-API - AI Endpoint (Gemini)
 *
 * Integrasi dengan Google's Gemini AI menggunakan format endpoint standar.
 * Endpoint ini mengambil prompt teks, nama model (opsional), dan logic (opsional),
 * lalu mengembalikan respons yang dihasilkan oleh AI.
 */

// Impor modul yang diperlukan
const axios = require('axios');
const {
    gemini_key
} = require('../../settings');

module.exports = {
    // Nama endpoint untuk dokumentasi
    name: "Gemini AI",
    // Deskripsi singkat tentang fungsi endpoint
    desc: "Berinteraksi dengan Google Gemini AI.",
    // Kategori untuk pengelompokan di dokumentasi
    category: "AI",
    // Parameter yang diperlukan oleh endpoint
    params: ["text", "logic"],

    /**
     * Fungsi utama yang akan dijalankan saat endpoint diakses.
     * @param {object} req Objek permintaan dari Express.
     * @param {object} res Objek respons dari Express.
     */
    async run(req, res) {
        // Ambil parameter dari query URL
        const text = req.query.text;
        const model = req.query.model || 'gemini-2.5-pro'; // Model default: gemini-pro
        const logic = req.query.logic; // Ambil instruksi sistem kustom

        // Validasi: Cek apakah parameter 'text' ada
        if (!text) {
            return res.json({
                status: false,
                message: "Masukan parameter 'text'",
                author: "San"
            });
        }

        // Validasi: Cek apakah API key Gemini sudah diatur
        if (!gemini_key || gemini_key === "MASUKAN_APIKEY_GEMINI_DISINI") {
            return res.json({
                status: false,
                message: "API Key Gemini belum diatur di settings.js",
                author: "San"
            });
        }

        try {
            // Buat URL untuk request ke Gemini API
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gemini_key}`;

            // Siapkan payload untuk API request
            const requestPayload = {
                contents: [{
                    parts: [{
                        text: text
                    }]
                }]
            };

            // Jika parameter 'logic' ada, tambahkan sebagai system instruction
            if (logic) {
                requestPayload.system_instruction = {
                    parts: [{
                        text: logic
                    }]
                };
            }

            // Kirim request POST ke Gemini API menggunakan axios
            const response = await axios.post(apiUrl, requestPayload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Ekstrak teks yang dihasilkan dari respons API, tambahkan pengecekan biar aman
            const generatedText = response.data.candidates && response.data.candidates[0].content.parts[0].text;
            
            if (!generatedText) {
                 return res.status(500).json({
                    status: false,
                    message: 'Gagal mendapatkan respons teks dari Gemini AI.',
                    author: "San"
                });
            }
             const cleanedText = generatedText.replace(/\*/g, '');

            // Kirim respons sukses dalam format JSON
            res.json({
                status: true,
                model: model,
                response: cleanedText,
                author: "San"
            });

        } catch (error) {
            // Catat error ke konsol untuk debugging
            console.error("Error fetching from Gemini API:", error.response ? error.response.data : error.message);

            // Kirim respons error ke klien
            res.status(500).json({
                status: false,
                message: 'Gagal memproses permintaan ke Gemini AI. Coba cek konsol untuk detailnya.',
                author: "San"
            });
        }
    }
};
