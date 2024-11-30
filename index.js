const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateInput = (name, email, message) => {
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Nama harus diisi');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Email tidak valid');
  }

  if (!message || message.trim() === '') {
    errors.push('Pesan harus diisi');
  }

  return errors;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  const validationErrors = validateInput(name, email, message);
  
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      message: 'Validasi gagal',
      errors: validationErrors 
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: `Pesan Baru dari ${name}`,
    text: `
      Nama: ${name}
      Email Pengirim: ${email}

      Pesan:
      ${message}
    `,
    replyTo: email
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email berhasil dikirim' });
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    res.status(500).json({ 
      message: 'Gagal mengirim email',
      error: error.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});