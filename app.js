const express = require('express')
const db = require('./db/mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require("cookie-parser")
const request = require('request');
const path = require('path');
const moment = require('moment');
const Goal = require('./models/goal')
const User = require('./models/user')
const nodemailer = require('nodemailer')
var sha256 = require('js-sha256')
const MongodbSession = require('connect-mongodb-session')(session)


const app = express()
const port = process.env.PORT || 3030

app.use(cookieParser())
app.use(express.json())

app.use(express.static("Public"));
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongodbSession({
  uri: 'mongodb connect ',
  collestion: 'sessions'
})

app.use(session({
  cookie: {
      httpOnly: true,
      maxAge: null
  },
  secret: 'uniqueKey',   //********************************  change it man!! it must be secret  ******************************************//
  resave: false,
  saveUninitialized: false,
  store: store,
}))

const isAuth = (req, res, next) => {
  if(req.session.isAuth) {
      next()
  } else {
      console.log("false");
      res.redirect('/')
  }
}



app.get('/', (req, res) => {
  res.render("main", {name: "", cross: "", wrong: ""});
})

app.post('/users', (req, res) => {
    
  const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      password: sha256(req.body.password),
  })

  var mailquery = User.find({email: req.body.email}); 
  var usernamequery = User.find({username: req.body.username}); 

  mailquery.count(function (err, count) { 
      if (count === 0) {
          usernamequery.count(function (err, count2) {
              if (count2 === 0) {
                  user.save(function(err){

                      id = user._id
                      email = user.email
                      validation_code = sha256(user.username)

                      let transporter = nodemailer.createTransport({
                          service: 'gmail',
                          auth: {
                              user: '' ,    // Sender email
                              pass: ''  // Sender password
                          }
                      });
                      
                      let mailOptions = {
                          from: '',
                          to: email,
                          subject: 'Test',
                          text: `Please click on the link provided to activate the account http://localhost:3030/users/${email}/${validation_code}/${id}`
                          /////// Change text link while deploying
                      };
                      
                      transporter.sendMail(mailOptions, (err, data) => {
                          if (err) {
                              res.render("message", {message: "Error occured"})
                          } else {
                              res.render("message", {message: "Go to your gmail to verify the account"});
                          }
                  })
                  
              })
                  } else {
                  res.render('main', { name: 'Username Already exist' , cross: "BACK TO LOGIN", wrong: ""})
                  // console.log("username already exist");
              }
              })

          } else {
              res.render('main', { name: 'Email Already exist' , cross: "BACK TO LOGIN", wrong: ""})
              // console.log("user already exist");
          }
           
})
  
})

app.get('/users/:email/:code/:id', (req, res) => {
  const email = req.params.email
  const validation_code = sha256(req.params.code)
  const _id= req.params.id

  User.findByIdAndUpdate(_id ,{"active": true, "validation_code": validation_code}, function(err, result){

      if(err){
          res.render("message", {message: "Error occured"});
      }
      else{
          res.render("message", {message: "Account verified. Go to login page"});
      }

  })
})

app.post('/reset', (req, res) => {
  email = req.body.email
  console.log(email);

  User.find({email: email}, {
  active: 0,
  _id: 1,
  first_name: 0,
  last_name: 0,
  username: 0,
  email: 0,
  password: 0,
  __v: 0}).then((users) => {

      validation_code = users[0]["validation_code"]
      id = users[0]["_id"]

      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL ,    // Sender email
              pass: process.env.PASSWORD  // Sender password
          }
      });
      
      let mailOptions = {
          from: 'kabirsinghnitp@gmail.com',
          to: email,
          subject: 'Test',
          text: `Please click on the link provided to reset password http://localhost:3030/reset/${email}/${validation_code}/${id}`
          /////// Change text link while deploying
      };
      
      transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
              res.render("message", {message: "Error occured"});
          } else {
              res.render("message", {message: "Go to your gmail to reset password"});
          }
  })

      
  }).catch((e) => {
      res.send(400).send(e)
  })

})

app.get('/reset/:email/:code/:id', (req, res) => {
  const email = req.params.email
  const validation_code = sha256(req.params.code)
  const id= req.params.id

  console.log(id);

  res.render("resetPassword", {id: id})

})

app.post('/signin', (req, res) => {
  email = req.body.email
  password = sha256(req.body.password)

  remember = Boolean(req.body.remember)

  User.find({email: email}, {
      active: 0,
      _id: 1,
      first_name: 0,
      last_name: 0,
      username: 0,
      __v: 0}).then((users) => {

          emaildb = users[0]["email"]
          passworddb = users[0]["password"]

          if( email == emaildb && password == passworddb ) {
              console.log("loged in");
              req.session.isAuth = true
              res.redirect("/dashboard")
          } else {
              res.render("main", {name: "", cross: "", wrong:"Wrong Credentials"})
          }
      }).catch((e) => {
          res.send(400).send(e)
      })
})

request('https://type.fit/api/quotes', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  app.get('/dashboard', isAuth,(req, res) => {
    let index = Math.floor(Math.random() * 1640)+1;
    const text = body[index]["text"]
    const author = body[index]["author"]
    res.render("index", {text: text, author: author})
    })
});

app.post('/logout', isAuth,(req, res) => {
  req.session.destroy((err) =>{
      if(err) throw err
      res.render("main", {name: "", cross: "", wrong:"Wrong Credentials"})
  })
})

app.get('/routine',function(req,res){
  res.render('routine', {});
});

app.get('/journal',function(req,res){
  res.render('journal', {});
});

app.get('/todolist',function(req,res){
  var day  = moment().format('dddd'); 
  Goal.countDocuments().then((goals) => {
    if(goals==0){
      res.render('todolist', {day: day, goal: ""});
    }
      
    else {
      Goal.find({flag: 'goal'}).then((goal) => {
        res.render('todolist', {day: day, goal: goal});
      })
      
    }
  })
});

app.post('/reset-password', (req, res) => {
  password = sha256(req.body.password)
  email = req.body.email ///// this is id

  
  User.findByIdAndUpdate(email ,{"password": password}, function(err, result){

      if(err){
          res.render("message", {message: "Error occured"});
      }
      else{
          res.render("message", {message: "Password reset successful! Go to login page"});
      }

  })
})

app.get('/routine',function(req,res){
  res.render('routine', {});
});
app.post('/planGoal',function(req,res){
  var day  = moment().format('dddd'); 
  const goal = new Goal({
    goals: req.body.goals
  })
  
  goal.save()
  Goal.countDocuments().then((goals) => {
    if(goals==0){
      res.render('todolist', {day: day, goal: ""});
    }
      
    else {
      Goal.find({flag: 'goal'}).then((goal) => {
        res.render('todolist', {day: day, goal: goal});
      })
      
    }
  })

  // res.render('todolist', {day: day});
});

app.post('/delete', (req, res) => {
  id = req.body.goal_id
  var day  = moment().format('dddd'); 
  Goal.find().deleteOne({"_id": id}).then((goal)=>{
    Goal.find({flag: 'goal'}).then((goal) => {
      res.render('todolist', {day: day, goal: goal});
    })
  })
})

app.listen(port, () => {
    console.log('Server is running on port ' + port)
})
