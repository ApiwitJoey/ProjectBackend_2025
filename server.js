const express = require('express');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const connectDB = require('./config/db');
const hospitals = require('./routes/hospitals');
const appointment = require('./routes/appointment');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const ratelimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const limiter = ratelimit({
    windowsMS :10*60*1000, //10min
    max : 100
});

const swaggerOptions = {
    swaggerDefinition : {
        openapi : '3.0.0',
        info : {
            title : 'Library API',
            version : '1.0.0',
            description : 'A simple Express VacQ API'
        },
        servers : [
            {
                url : 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

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
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use('/api/v1/hospitals',hospitals);
app.use('/api/v1/appointments',appointment);
app.use('/api/v1/auth',auth);
app.use(cookieparser());



const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log('Server running in ',process.env.NODE_ENV,' mode on port ',PORT));

process.on('unhandledRejection',(err,Promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
})
