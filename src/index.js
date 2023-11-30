const express = require("express");
const path = require('path');
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');

const dbConnection = require('./database');
const {body, validationResult} = require('express-validator');
const session = require("express-session");

//login and register

const app = express();
app.use(express.urlencoded({ extended: false}))

app.use('/assets', express.static('assets'))

app.get('/register', (req, res) => {
    // Render the "register.ejs" view
    res.render('register');
  });
  app.get('/login', (req, res) => {

    res.render('login');
  });

  app.get('/index', (req, res) => {

    res.render('index');
  });
  app.get('/write', (req, res) => {

    res.render('write');
  });


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
  
  app.use(
    cookieSession({
      name: 'session',
      keys: ['key1','key2'],
      maxAge: 3600*1000 //1hour
    })
  );
  
const ifNotLoggedIn = (req, res, next) => {
if (!req.session.isLoggedIn) {

        return res.render('login');
}
next();
}

const ifLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/index');
    }
    next(); 
}


app.get('/', ifNotLoggedIn, (req,res, next) =>{
    dbConnection.execute("SELECT user_username FROM user_info WHERE user_username =", [req, session.userID]).then(([row]) => {res.render('index', {
        name: row[0].name

    })})
})


// app.post('/register', (req, res) => {
//     const { user_username, user_email, user_password } = req.body;
//     const sql = 'INSERT INTO users (user_username, user_email, user_password) VALUES (?, ?, ?)';
//     const values = [user_username, user_email, user_password];
  
//     dbConnection.query(sql, values, (err, result) => {
//       if (err) throw err;   
//       console.log('User registered:', result);
//       res.send('Registration successful!');
//     });
//   });


app.post('/register', async (req, res) => {
    try {
      // Check if the email already exists
      const emailExists = await dbConnection.execute('SELECT * FROM users WHERE user_email = ?', [req.body.user_email]);
  
      if (emailExists[0].length > 0) {
        return res.json({
          "error": "Email is already in use"
        });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.user_password, 12);
  
      // Insert the user into the database
      const result = await dbConnection.execute('INSERT INTO users (user_username, user_email, user_password, user_birthday, user_phonenumber) VALUES (?, ?, ?, ?, ?)', [req.body.user_username, req.body.user_email, hashedPassword, req.body.user_birthday, req.body.user_phonenumber]);
  
      res.render('index');
    } catch (error) {
      console.error(error);
      res.json({
        "error": "Registration failed"
      });
    }
  });
  
  
  app.post('/login', async (req, res) => {
    try {
      const { user_username, user_password } = req.body;
  
      // Check if the user with the given username exists
      const [user] = await dbConnection.execute('SELECT user_username, user_password FROM users WHERE user_username = ?', [user_username]);
  
      if (user.length === 0) {
        // Invalid username
        return res.render('login', { error: 'Invalid username or password' });
      }
  
      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(user_password, user[0].user_password);
  
      if (passwordMatch) {
        // Set the user as logged in in the session
        req.session.isLoggedIn = true;
        req.session.userID = user[0].user_username;
  
        // Redirect to /index after successful login
        return res.redirect('/index');
      } else {
        // Invalid password
        return res.render('login', { error: 'Invalid username or password' });
      }
    } catch (error) {
      console.error(error);
      // Redirect to 404error.ejs in case of an error
      res.status(404).render('404error');
    }
  });
  
  
  app.listen(3000, () => console.log("server is running: 3000"));



