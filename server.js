const express = require('express');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const connectDB = require('./config/db');
const campgrounds = require('./routes/campgrounds');
const reserve = require('./routes/reserve');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const ratelimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


const limiter = ratelimit({
    windowsMS :10*60*1000, //10min
    max : 100
});



//Load Env
dotenv.config({path:'./config/config.env'});

connectDB();

const app = express();

app.use(express.json());
app.use(mongoSanitize());
app.use(helmet()); 
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use(cors());

app.use('/api/v1/campgrounds',campgrounds);
app.use('/api/v1/reserves',reserves);
app.use('/api/v1/auth',auth);
app.use(cookieparser());



const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log('Server running in ',process.env.NODE_ENV,' mode on port ',PORT));

process.on('unhandledRejection',(err,Promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
})
