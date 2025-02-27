const { json } = require('express');
const Campground = require('../models/Campground');
const { param } = require('../routes/campgrounds');
const Reserve = require('../models/Reserve');
//@desc Get all hospitals
//@route GET /api/v1/hospitals
//@access Public
exports.getCampgrounds = async (req, res, next) => {
    let query;

    const reqQuery = {...req.query};

    const removeFields = ['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create querystr
    let queryStr = JSON.stringify(req.query);
    //Create Op
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`)

    //find res 
    query=Campground.find(JSON.parse(queryStr)).populate('reserves');

    //select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    //sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else 
        query = query.sort('-createdAt');

    //pagination
    const   page = parseInt(req.query.page,10) || 1;
    const   limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;

    try {
        const total = await Campground.countDocuments();
        query = query.skip(startIndex).limit(limit);
        //Executing query
        const campgrounds = await query;

        //Pagination result
        const pagination = {};
        if (endIndex<total) {
            pagination.next={
                page:page+1,
                limit
            }
        }
        if (startIndex>0) {
            pagination.prev={
                page:page-1,
                limit
            }
        }
        res.status(200).json({ success: true, count: campgrounds.length,data:campgrounds});
    } catch (err) {
        res.status(400).json({ success: false    });
    }
};



//@desc Get single hospital
//@route GET /api/v1/hospitals/:id
//@access Public
exports.getCampground = async (req, res, next) => {
    try {
        const campgrounds = await Campground.findById(req.params.id);

        if(!campgrounds) {
            return res.status(400).json({ success: false});
        }
        res.status(200).json({ success: true,data:campgrounds});
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc Create new hospital
//@route POST /api/v1/hospitals
//@access Private
exports.createCampground = async (req, res, next) => {
    const campground = await Campground.create(req.body);
    //console.log(req.body);
    res.status(201).json({ success: true,data:campground});
};

//@desc Update hospital
//@route PUT /api/v1/hospitals/:id
//@access Private
exports.updateCampground = async (req, res, next) => {
    try {
        const campgrounds = await Campground.findByIdAndUpdate(req.params.id,req.body, {
            new :true,
            runValidators:true
        });

        if(!campgrounds) {
            return res.status(400).json({ success: false});
        }
        res.status(200).json({ success: true,data:campgrounds});
    } catch (err) {
        res.status(400).json({ success: false    });
    }
};

//@desc Delete hospital
//@route DELETE /api/v1/hospitals/:id
//@access Private
exports.deleteCampground = async (req, res, next) => {
    try {
        const campgrounds = await Campground.findById(req.params.id);

        if(!campgrounds) {
            return res.status(400).json({ success: false,message:`Campground not found with id of ${req.params.id}`});
        }
        await Reserve.deleteMany({campground:req.params.id});
        await Campground.deleteOne({_id:req.params.id});

        res.status(200).json({ success: true,data:{}});
    } catch (err) {
        res.status(400).json({ success: false    });
    }
};
