const mongoose = require('mongoose');

module.exports = mongoose.model('ClassRoom', new mongoose.Schema({
    name: String,
    schoolId: String,
    schedule: {
        day: String,
        startTime: String,
        endTime: String
    },
    students: [String]
}));
