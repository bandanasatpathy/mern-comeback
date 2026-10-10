const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {    
        type: Date,
        default: Date.now,
        expires: '12h' // Token will expire after 12 hour
    }
});

module.exports = mongoose.model('Auth', authSchema);