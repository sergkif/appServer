const mongoose = require('mongoose')

const merchantSchema = mongoose.Schema({
    billId: String,
    email: String
});

module.exports = mongoose.model('Merchant', merchantSchema);