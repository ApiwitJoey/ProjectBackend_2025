const Log = require('../models/Log');

exports.getLogs = async (req, res, next) => {
    try {
        const logs = await Log.find().populate('user', 'name email').populate('reserve', 'rDate');
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Cannot fetch logs" });
    }
};
