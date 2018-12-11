const express = require('express');
const app = express();
const path = require('path');
const constants = require('./modules/constants');
const REICEIVED_BY_DATE = require( constants.FILES.RECEIVED_BY_DATE );
const SENDED_BY_DATE = require(constants.FILES.SENDED_BY_DATE);

app.listen(3333, () => console.log("server listening on port 3333"))

app.use("/", express.static( constants.FILES.CLIENT_DIR ))

app.get('/receivedByDate', (req, res) => {
    res.json(REICEIVED_BY_DATE);
})

app.get('/sendedByDate', (req, res) => {
    res.json(SENDED_BY_DATE);
})

app.get('/minDate', (req, res) => {
    res.send(REICEIVED_BY_DATE[0].weekOfReceiving);
})

app.get('/maxDate', (req, res) => {
    res.send(REICEIVED_BY_DATE[ REICEIVED_BY_DATE.length - 1 ].weekOfReceiving);
})