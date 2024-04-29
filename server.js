const express = require('express');
require('./config/config');
const cors = require('cors');
const bodyParser = require("body-parser")
// const ipfilter = require('express-ipfilter').IpFilter
require('dotenv').config();
const userRouter = require('./routers/userRouter');
const walletRouter = require('./routers/walletRouter');

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

const port = process.env.port;

app.listen(port, () => {
  console.log(`This server is listening on port: ${port}`);
});
