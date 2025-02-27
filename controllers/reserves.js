const Reserve = require('../models/Reserve');
const Campground = require('../models/Campground');

// Get all appointment
//get api/v1/appointments
exports.getReserves = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin') {
        query = Reserve.find({ user: req.user.id }).populate({
            path: 'campground',
            select: 'name province tel'
        });
    } else { // If you are admin see all
        if (req.params.campgroundId) {
            console.log(req.params.campgroundId);
            query = Reserve.find({
                campground: req.params.campgroundId
            }).populate({
                path: 'campground',
                select: 'name province tel'
            });
        } else query = Reserve.find().populate({
            path: 'campground',
            select: 'name province tel'
        });
        
    }

    try {
        const reserves = await query;

        res.status(200).json({
            success: true, // Fixed the typo here
            count: reserves.length, // Using the correct variable name
            data: reserves // Using the correct variable name
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Cannot find Reserve' }); // Fixed the typo here
    }
};

//get single appointment
//get api/v1/appointments/id
exports.getReserve = async (req,res,next) => {
    try {
        const reserve = await Reserve.findById(req.params.id).populate({
            path:'campground',
            select : 'name province tel'
        });

        if (!reserve) {
            return res.status(404).json({success:false,message:`No reserve with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            message: reserve
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Reserve"});
    }
};

//add appointment
//post api/v1/hospitals/:hospitalId/appointments
exports.addReserve = async (req,res,next) => {

    try {
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);
        if (!campground){
            return res.status(404).json({success:false,message:`No campground with the id of ${req.params.campgroundId}`});
        }
        console.log(req.body);
        //add user id to req.body
        req.body.user = req.user.id;

        //check for existed appointment
        const existedReserve = await Reserve.find({user:req.user.id});

        //user not admin, they can only create 3 appointment
        if (existedReserve.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 reserve`});
        }
        console.log(req.body);
        const reserve = await Reserve.create(req.body);

        res.status(200).json({success:true,data :reserve});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot Create Reserve"});
    }
};

//update appointment
//PUT /api/v1/appointments/:id
exports.updateReserve = async (req,res,next) => {

    try {
        let reserve = await Reserve.findById(req.params.id);

        if (!reserve)
            return res.status(404).json({success:false,message:`No reserve with the id of ${req.params.id}`});
        
        //make sure user is the appointment owner 
        if (reserve.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this reserve`});
        }

        reserve =  await Reserve.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});

        res.status(200).json({success:true,data:reserve});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update Reserve"});
    }
};

//delete appointment
// Delete /api/v1/appointment/:id
exports.deleteReserve = async (req,res,next) => {

    try {
        let reserve = await Reserve.findById(req.params.id);

        if (!reserve)
            return res.status(404).json({success:false,message:`No reserve with the id of ${req.params.id}`});
        //make sure user is the appointment owner 
        if (reserve.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this reserve`});
        }

        await reserve.deleteOne();  

        res.status(200).json({success:true,data:{}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Reserve"});
    }
};