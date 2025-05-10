const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/uploads', express.static('uploads'));



mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(5000, () => console.log('Server running')))
  .catch(err => console.error(err));