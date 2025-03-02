const Log = require('../models/Log');

exports.getLogs = async (req, res, next) => {
    try {
        const logs = await Log.find()
            .populate({
                path: 'user',
                select: 'name email role' // Include user role
            })
            .populate({
                path: 'reserve',
                populate: {
                    path: 'campground', // Populate campground details
                    select: 'name province telephone'
                },
                select: 'rDate user' // Include reservation date and user
            });

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Cannot fetch logs" });
    }
};
