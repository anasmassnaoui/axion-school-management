const mongoose = require('mongoose');

module.exports = mongoose.model('School', new mongoose.Schema({
    name: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: String
    },
    contactInfo: {
        email: String,
        phone: String,
        website: String
    },
    admins: [String],
    students: [String],
}));
