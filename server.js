const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'innovexorsecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/innovexor';
mongoose.connect(mongoURI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  gender: { type: String, default: '' }
});
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true }
});
const Message = mongoose.model('Message', messageSchema);

const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true },
  updates: { type: String, required: true }
});
const Waitlist = mongoose.model('Waitlist', waitlistSchema);

const handleRegister = async (req, res) => {
  try {
    const { email, password, bio, gender } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, bio, gender });
    await user.save();
    req.session.userId = user._id;
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/auth/register', handleRegister);
app.post('/api/auth/register', handleRegister);

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    req.session.userId = user._id;
    res.status(200).json({ message: 'Logged in successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/auth/login', handleLogin);
app.post('/api/auth/login', handleLogin);

const handleLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
app.post('/auth/logout', handleLogout);
app.post('/api/auth/logout', handleLogout);

const handleMe = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.get('/auth/me', handleMe);
app.get('/api/auth/me', handleMe);

const handleUpdateUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { email, password, bio, gender } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (gender !== undefined) updateData.gender = gender;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.session.userId, updateData, { new: true }).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.put('/auth/update', handleUpdateUser);
app.put('/api/auth/update', handleUpdateUser);

const handleDeleteUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await User.findByIdAndDelete(req.session.userId);
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ error: 'Failed to clear session' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'User deleted successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.delete('/auth/delete', handleDeleteUser);
app.delete('/api/auth/delete', handleDeleteUser);

const handleCreateMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const userId = req.session.userId || null;
    const msg = new Message({ userId, name, email, message });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/message', handleCreateMessage);
app.post('/api/message', handleCreateMessage);

const handleReadMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ userId: id });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.get('/message/:id', handleReadMessages);
app.get('/api/message/:id', handleReadMessages);

const handleUpdateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Missing message content' });
    }
    const msg = await Message.findByIdAndUpdate(id, { message }, { new: true });
    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.put('/notes/:id', handleUpdateMessage);
app.put('/api/notes/:id', handleUpdateMessage);

const handleCreateWaitlist = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized to join waitlist' });
    }
    const { email, updates } = req.body;
    if (!email || !updates) {
      return res.status(400).json({ error: 'Missing email or updates preference' });
    }
    const item = new Waitlist({ email, updates });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/waitlist', handleCreateWaitlist);
app.post('/api/waitlist', handleCreateWaitlist);

app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
