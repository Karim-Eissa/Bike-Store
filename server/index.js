const express= require('express');
const morgan=require('morgan');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const appRoutes=require('./routes/appRoutes');
const authRoutes=require('./routes/authRoutes');
require('dotenv').config();
app.use(morgan('dev'));
dotenv.config();
const app=express();
const port=process.env.PORT || 3001;
const databaseURL=process.env.DATABASE_URL;
app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}))
app.use(cookieParser());
app.use(express.json());

//routes
app.use('/api',appRoutes);
app.use('/api/auth',authRoutes);
app.use((req,res)=>{
	res.json({error:'404 page not found'});
})

const server=app.listen(port,()=>{
    console.log("Server is running on port",port)
})




