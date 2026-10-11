const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./src/routes/auth.route');
const taskRoutes = require('./src/routes/task.route');
const userRoutes = require('./src/routes/user.routes');
const taskCommentRoutes = require("./src/routes/taskComment.route");
const projectRoutes = require("./src/routes/project.route");

app.use('/auth', authRoutes);
app.use("/auth/projects", projectRoutes);
app.use('/auth/tasks', taskRoutes);
app.use('/auth/users', userRoutes);
app.use('/auth/taskComments', taskCommentRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});