import express from 'express'
import {connectDB} from './config/config.js'
import cors from 'cors'
import bodyParser from "body-parser"
// import ipfilter from 'express-ipfilter'.IpFilter
import dotenv from 'dotenv'
import userRouter from './routers/userRouter.js'
import walletRouter from './routers/walletRouter.js'


const app = express();
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())

// const whitelist = ['52.31.139.75']
// app.use(ipfilter(whitelist, { mode: 'allow' }))

app.use('/api/v1', userRouter);
app.use('/api/v1', walletRouter);


app.get('/', (req, res) => {
    res.send('Welcome to your API!');
  });

dotenv.config()
const port = process.env.port;

connectDB().then(() => {
        app.listen(port, () => {
            console.log(`Server is listening on port: ${port}`)
        })
    }).catch(err => {
        console.error('Failed to start server:', err)
    })
