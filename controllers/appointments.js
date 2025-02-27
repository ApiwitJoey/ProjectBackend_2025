const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

// Get all appointment
//get api/v1/appointments
exports.getAppointments = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin') {
        query = Appointment.find({ user: req.user.id }).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    } else { // If you are admin see all
        if (req.params.hospitalId) {
            console.log(req.params.hospitalId);
            query = Appointment.find({
                hospital: req.params.hospitalId
            }).populate({
                path: 'hospital',
                select: 'name province tel'
            });
        } else query = Appointment.find().populate({
            path: 'hospital',
            select: 'name province tel'
        });
        
    }

    try {
        const appointments = await query;

        res.status(200).json({
            success: true, // Fixed the typo here
            count: appointments.length, // Using the correct variable name
            data: appointments // Using the correct variable name
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Cannot find Appointment' }); // Fixed the typo here
    }
};

//get single appointment
//get api/v1/appointments/id
exports.getAppointment = async (req,res,next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path:'hospital',
            select : 'name province tel'
        });

        if (!appointment) {
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            message: appointment
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Appointment"});
    }
};

//add appointment
//post api/v1/hospitals/:hospitalId/appointments
exports.addAppointment = async (req,res,next) => {

    try {
        req.body.hospital = req.params.hospitalId;

        const hospital = await Hospital.findById(req.params.hospitalId);
        if (!hospital){
            return res.status(404).json({success:false,message:`No hospital with the id of ${req.params.hospitalId}`});
        }
        console.log(req.body);
        //add user id to req.body
        req.body.user = req.user.id;

        //check for existed appointment
        const existedAppointment = await Appointment.find({user:req.user.id});

        //user not admin, they can only create 3 appointment
        if (existedAppointment.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 appointment`});
        }
        console.log(req.body);
        const appointment = await Appointment.create(req.body);

        res.status(200).json({success:true,data :appointment});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot Create Appointment"});
    }
};

//update appointment
//PUT /api/v1/appointments/:id
exports.updateAppointment = async (req,res,next) => {

    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment)
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        
        //make sure user is the appointment owner 
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
        }

        appointment =  await Appointment.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});

        res.status(200).json({success:true,data:appointment});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update Appointment"});
    }
};

//delete appointment
// Delete /api/v1/appointment/:id
exports.deleteAppointment = async (req,res,next) => {

    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment)
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        //make sure user is the appointment owner 
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this appointment`});
        }

        await appointment.deleteOne();  

        res.status(200).json({success:true,data:{}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Appointment"});
    }
};