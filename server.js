require('./config'); // load global config

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connect ke MongoDB
mongoose.connect(global.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema User
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// API register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email dan password wajib diisi' });
  try {
    const exist = await User.findOne({ email });
    if (exist) return res.status(409).json({ message: 'Email sudah terdaftar' });

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.json({ message: 'Registrasi berhasil', user: newUser });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// API login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email dan password wajib diisi' });
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Email atau password salah' });
    res.json({ message: 'Login berhasil', user });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || global.YUOR_PORT || 8000;
app.listen(PORT, () => {
  console.log(`${global.creator}'s server running on port ${PORT}`);
});