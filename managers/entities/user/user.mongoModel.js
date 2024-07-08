const mongoose      = require('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        index: true, 
    },
    name: String,
    role: String,
    password: String,
    
}));
