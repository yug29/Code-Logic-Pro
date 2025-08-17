if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config()
}

const express = require('express')
const bodyparser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./passport-config.js')
const flash = require('express-flash')
var mysql = require('mysql2')
const session = require('express-session')
const path = require('path')
const method = require('method-override')

const staticFile = path.join(__dirname, "./public")
const imageFile = path.join(__dirname, "./img")

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

const checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/login')
    }
    next()
}

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.use(express.urlencoded({
    extended: false
}))

app.use(express.static(staticFile))
app.use(express.static(imageFile))

app.use(flash())
app.use(session({
    secret: "MY_SECRET_KEY",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(method('_method'))

app.post('/login', checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const name = req.body.name
        const email = req.body.email
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            score: 0,
            password: hashedPassword
        })

        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "Evenidk@123",
            database: "quizusers"
        });
        const sql = 'INSERT INTO myusers VALUES (?,?,?,?,?)';
        con.query(sql, [name, email, hashedPassword, 0, null], (res, err) => {
            if (err) {
                console.log(err);
                console.log("err2");

            } else {
                console.log("Data Added Successfully.");
            }
        });

        res.redirect("/login")

    } catch (e) {
        res.redirect("/register")
        console.log(e)
    }
})

app.post('/submit', checkAuthenticated, (req, res) => {
    const score = req.body.score;
    const lang = req.body.lang;
    const username = req.user.name;
    // const email = req.user.email;
    // const password = req.user.password;
    console.log(score);

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Evenidk@123",
        database: "quizusers"
    });
    const sql = 'update myusers set score = (?),lang = (?) where u_name = (?)';
    con.query(sql, [score, lang, username], (res, err) => {
        if (err) {
            console.log(err);
            console.log("err");
        } else {
            console.log("Data Added Successfully.");
        }
    });
    res.render('Score.ejs', { name: username, score: score })
})

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.get('/c', (req, res) => {
    res.render('C.ejs')
})

app.get('/node', (req, res) => {
    res.render('Node.ejs')
})

app.get('/sql', (req, res) => {
    res.render('Sql.ejs')
})

app.get('/js', (req, res) => {
    res.render('Js.ejs')
})

app.get('/python', (req, res) => {
    res.render('Python.ejs')
})

app.get('/score', checkAuthenticated, (req, res) => {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Evenidk@123",
        database: "quizusers"
    });
    const u_name = req.user.name
    const sql = 'SELECT score,lang FROM myusers WHERE u_name = (?)';
    con.query(sql, [u_name], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error in Fetching Score.');
        }
        const lang_score = results[0].score
        const language = results[0].lang
        res.render('Score.ejs' , {name : req.user.name , score : lang_score , lang: language} )
    })
})


app.delete('/logout', (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect('/login')
    })
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.listen(3000)
console.log(users)
