const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
	accountNo: { type:String, index:true },
	periodStart: Date,
	periodEnd: Date,
	kWh: Number,
	amount: Number,
	createdAt: { type:Date, default: Date.now }
});

module.exports = mongoose.model('Bill', BillSchema);

