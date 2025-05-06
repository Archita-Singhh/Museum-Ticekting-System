const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/museum-booking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Failed to connect to MongoDB', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

// Serve the HTML login page
app.use(express.static('public'));

// POST request to handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
        return res.send('User not found');
    }

    // Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.send('Incorrect password');
    }

    // Redirect to home page after successful login
    res.redirect('/home');
});

// POST request to handle user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = new User({
        username,
        password: hashedPassword
    });

    // Save user to database
    await newUser.save();
    res.send('Registration successful');
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
