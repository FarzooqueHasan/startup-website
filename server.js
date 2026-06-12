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

let useMock = false;
let mockUsers = [];
let mockMessages = [];
let mockWaitlist = [];

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/innovexor';
mongoose.connect(mongoURI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error, using mock:', err.message);
  useMock = true;
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

const findUserByEmail = async (email) => {
  if (useMock) {
    return mockUsers.find(u => u.email === email);
  }
  return await User.findOne({ email });
};

const findUserById = async (id) => {
  if (useMock) {
    return mockUsers.find(u => u._id === id);
  }
  return await User.findById(id).select('-password');
};

const saveUser = async (userData) => {
  if (useMock) {
    const user = { _id: new mongoose.Types.ObjectId().toString(), ...userData };
    mockUsers.push(user);
    return user;
  }
  const user = new User(userData);
  await user.save();
  return user;
};

const updateUserById = async (id, updateData) => {
  if (useMock) {
    const idx = mockUsers.findIndex(u => u._id === id);
    if (idx === -1) return null;
    mockUsers[idx] = { ...mockUsers[idx], ...updateData };
    const result = { ...mockUsers[idx] };
    delete result.password;
    return result;
  }
  return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
};

const deleteUserById = async (id) => {
  if (useMock) {
    mockUsers = mockUsers.filter(u => u._id !== id);
    mockMessages = mockMessages.filter(m => m.userId !== id);
    return true;
  }
  await User.findByIdAndDelete(id);
  return true;
};

const saveMessage = async (msgData) => {
  if (useMock) {
    const msg = { _id: new mongoose.Types.ObjectId().toString(), ...msgData };
    mockMessages.push(msg);
    return msg;
  }
  const msg = new Message(msgData);
  await msg.save();
  return msg;
};

const findMessagesByUserId = async (userId) => {
  if (useMock) {
    return mockMessages.filter(m => m.userId === userId);
  }
  return await Message.find({ userId });
};

const updateMessageById = async (id, messageText) => {
  if (useMock) {
    const idx = mockMessages.findIndex(m => m._id === id);
    if (idx === -1) return null;
    mockMessages[idx].message = messageText;
    return mockMessages[idx];
  }
  return await Message.findByIdAndUpdate(id, { message: messageText }, { new: true });
};

const saveWaitlist = async (wlData) => {
  if (useMock) {
    const wl = { _id: new mongoose.Types.ObjectId().toString(), ...wlData };
    mockWaitlist.push(wl);
    return wl;
  }
  const wl = new Waitlist(wlData);
  await wl.save();
  return wl;
};

const handleRegister = async (req, res) => {
  try {
    const { email, password, bio, gender } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await saveUser({ email, password: hashedPassword, bio, gender });
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
    const user = await findUserByEmail(email);
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
    const user = await findUserById(req.session.userId);
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
    const user = await updateUserById(req.session.userId, updateData);
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
    await deleteUserById(req.session.userId);
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
    const msg = await saveMessage({ userId, name, email, message });
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
    const messages = await findMessagesByUserId(id);
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
    const msg = await updateMessageById(id, message);
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
    const item = await saveWaitlist({ email, updates });
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
