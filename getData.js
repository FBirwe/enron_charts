const mysql = require('mysql');
const fs = require('fs');
const Stopwatch = require('./modules/stopwatch');
const constants = require('./modules/constants');

const con = mysql.createConnection({
    host: "localhost",
    database : 'enron',
    user: "node",
    password: "password",
    port : 3306 
});
  

con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    // selectLimitedMessages( constants.SQL.SELECT_BY_DATE_AND_SENDER, constants.FILES.SENDED_BY_DATE );
    selectSpecificMessage();
});

function selectLimitedMessages( sqlQuery, dataFile ) {
    const stopper = new Stopwatch();
    stopper.start();

    con.query( sqlQuery, (err, result) => {
        if(err) throw err;

        fs.writeFile( dataFile, JSON.stringify(result), err => {
            if(err) {
                throw err;
            } else {
                console.log("done!");
                endProcess();
            }
        })
    })
}

function selectSpecificMessage() {
    con.query( "SELECT * FROM message WHERE mid = 68637", (err, result) => {
        if (err) throw err;

        for(let i in result[0]) {
            fs.appendFile("email.txt", `${i} – ${result[0][i]}\r`, err => err ? console.log(err) : console.log("done!"));
        }
    })
}

function endProcess() {
    process.exit(0);
}