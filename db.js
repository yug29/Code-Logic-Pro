var mysql = require('mysql2')
const express = require('express')
const bodyparser = require('body-parser')

const app = express()

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Evenidk@123",
    database : "test"
});

// con.connect((err) => {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log("Connected!");
//     }
// });

con.query("select * from quizinfo" , (res, err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res);
    }
});
