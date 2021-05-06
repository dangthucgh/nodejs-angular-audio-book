// app/models/user.js
// load những thư viện chúng ta cần
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
// định nghĩ cấu trúc user model
const SocialSchema = mongoose.Schema({
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});
const Social = mongoose.model('social', SocialSchema);
module.exports = Social;
