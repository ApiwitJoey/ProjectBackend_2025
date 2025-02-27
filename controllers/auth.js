const User = require('../models/User');

//Register 
//Post /api/v1/auth/register
//Public
exports.register = async (req,res,next) => {
    try {
        const {name,email,password,role} = req.body;

        //create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        //create token
        //const token = user.getSignedJwtToken();
        //res.status(200).json({success:true,token});
        sendTokenRespsone(user,200,res);
    } catch (err) {
        console.log(err);
        res.status(400).json({success:false});
    }
    //res.status(200).json({success:true});
};

exports.login = async (req,res,next) => {
    try {
    const {email,password} = req.body;

    //Validate email & password
    if (!email || !password) 
        return res.status(400).json({success:false,msg:"Please provide an email and password"});

    //Check user
    const user = await User.findOne({email}).select('+password');

    if (!user) 
        return res.status(400).json({success:false,msg:"Invalid credentials"});

    //Check password match
    const ismatch = await user.matchPassword(password);

    if (!ismatch)
        return res.status(400).json({success:false,msg:"Invalid credentials"});

    //     const token = user.getSignedJwtToken();
    //     res.status(200).json({success:true,token})
    sendTokenRespsone(user,200,res);
    }catch(err) {
        return res.status(401).json({success:false,msg:'Cannot Convert email or password string'});
    }
}

const sendTokenRespsone=(user,statusCode,res) => {
    //create token
    const token = user.getSignedJwtToken();

    const options = {
        expire:new Date(Date.now + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };

    if(process.env.NODE_ENV=='production') {
        options.secure = true;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token
    })
}

exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({ success: true, data: user });
}

exports.logout = async (req,res,next) => {
    res.cookie('token','none', {
        expire : new Date(Date.now + 10*1000),
        httpOnly : true
    });

    res.status(200).json({
        success : true,
        data : {}
    })
};