const mongoose = require('mongoose')

const User = mongoose.model('Users', {
    name: String,
    email: String,
    password: String
})

module.exports = User



