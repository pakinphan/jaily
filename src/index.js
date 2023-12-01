const express = require("express");
const path = require('path');
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');

const dbConnection = require('./database');
const {body, validationResult} = require('express-validator');
const session = require("express-session");

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


app.get("/", (req, res) => {
    try {
      // Query to retrieve data from your MySQL database
      dbConnection.query("SELECT * FROM story_info", (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).render("error", { error: "Internal Server Error" });
        }
  
        // Render EJS template and pass data to it
        res.render("index", { stories: result });
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error", { error: "Internal Server Error" });
    }
  });
// app.use((req, res, next) => {
//     // Create an error object
//     const err = new Error('Not Found');
//     err.status = 404;
  
//     // Forward the error to the next middleware
//     next(err);
//   });
  
//   // Middleware to render the custom 404 page
//   app.use((err, req, res, next) => {
//     // Check if the error status is 404
//     if (err.status === 404) {
//       // Render the custom 404 page
//       return res.status(404).render('404error.ejs');
//     }
  
//     // For other errors, you can handle them accordingly
//     // For example, render an error page or send a JSON response
//     res.status(err.status || 500);
//     res.send('Internal Server Error');
//   });
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
  
      res.render('login');
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

//login Page
// app.post('/', ifLoggedIn, [
//     body('user_username').custom((value) => {
//         return dbConnection.execute('SELECT user_username FROM users where user_username = ?', [value])
//         .then(([rows]) => {
//             if (rows.length == 1){
//                 return true;
//             }
//             return Promise.reject("Invalid Username!")
//         });
//     })
// ])



//      register
//  app.post('/register', [
//     body('user_email', 'Invalid Email Address!').isEmail().custom((value) => {
//         return dbConnection.execute('SELECT user_email FROM user_info WHERE user_email = ?', [value]).then(([rows]) => {
//             if (row.length > 0) {
//                 return Promise.reject('This email already in use!');
//             }
//             return true;
//          })
//      }),
//      body('user_username', 'User is empty!').trim().not().isEmpty(),
//      body('user_pass', 'The password must be of minimum length 6 charactor').trim().isLength({ min: 6 }),
//      //end of post data validation
//  ],
//  (req, res, next) => {
//      const validation_result = validationResult(req);
//      const { user_username, user_password, user_email} = req.body;

//      if (validation_result.isEmpty()) {
//          bcrypt.hash(user_password, 12).then((hash_password) => {
//              dbConnection.execute('INSERT INTO user_info (user_username, user_email, user_password) VALUES(?, ?, ?)', [user_username, user_email, hash_password])
//              .then(result => {
//                  res.send('Your account has been create successfully, Now you can <a href="/"> Login </a>');
//              }).catch(err => {
//                  if (err) throw err;
//              })
//      }).catch(err => {
//              if (err) throw err;
//          })
//      }else {
//          let allErrors = validation_result.errors.map((error) => {
//              return error.msg;
//          })
//          res.render('register', {
//              register_error: allErrors,
//              old_data: req.body
//          })
//      }
//  }
//  )












// console.log("test")




// //   app.use(express.json());






  
//   app.get("/login", function (request, response) {
//     response.sendFile(path.join(__dirname + "/login.html"));
//   });
  
//   app.post("/auth", function (request, response) {
//     var username = request.body.username;
//     var password = request.body.password;
  
//     if (username && password) {
//       connection.query(
//         "SELECT * FROM user_info WHERE user_username = ? AND user_password = ? ",
//         [username, password],
//         function (error, results, fields) {
//           //console.log(username);
//           if (results.length > 0) {
//             request.session.loggedin = true;
//             request.session.username = username;
//             //response.redirect("/home");
//             response.redirect("/webboard");
//           } else {
//             response.send("Incorrect Username and/or Password");
//           }
//           response.end();
//         }
//       );
//     } else {
//       response.send("Please enter Username and Password");
//       response.end();
//     }
//   });
  
//   app.get("/webboard", (req, res) => {
//     if (req.session.loggedin)
//       connection.query("SELECT * FROM user_info", (err, result) => {
//         res.render("index.ejs", {
//           posts: result,
//         });
//         console.log(result);
//       });
//     else
//       res.send("You must login First!!!");
//     console.log("You must login First!!!");
//     // res.end();
//   });
  
//   app.get("/signout", function (request, request) {
//     request.session.destroy(function (err) {
//       response.send("Signout ready!");
//       response.end();
//     })
//   })
  
//   app.get("/add", (req, res) => {
//     res.render("add.ejs");
//   })
  
//   app.post("/add", (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;
//     const email = req.body.email;
//     const post = {
//       user_username: username, //ไม่แน่ใจ
//       user_password: password,
//       user_email: email
//     };
//     if (req.session.loggedin)
//       connection.query("INSERT INTO user_info SET ?", post, (err) => {
//         console.log("Data Inserted");
//         return res.redirect("/webboard");
//       });
//     else res.send("You must to login First!!!");
//     console.log("You must to login First!!!");
//     //   res.end();
//   });
  
  
//   app.get("/edit/:id", (req, res) => {
//     const edit_postID = req.params.id;
  
//     connection.query(
//       "SELECT * FROM user_info WHERE id=?",
//       [edit_postID],
//       (err, results) => {
//         if (results) {
//           res.render("edit", {
//             post: results[0],
//           });
//         }
//       }
//     );
//   });
  
//   app.post("/edit/:id", (req, res) => {
//     const update_username = req.body.username;
//     const update_password = req.body.password;
//     const update_email = req.body.email;
//     const id = req.params.id;
//     connection.query(
//       "UPDATE user_info SET user_username = ?,user_password = ? ,user_email = ? WHERE id = ?",
//       [update_username, update_password, update_email, id],
//       (err, results) => {
//         if (results.changedRows === 1) {
//           console.log("Post Updated");
//         }
//         return res.redirect("/webboard");
//       }
//     );
//   });
  
//   app.get("/delete/:id", (req, res) => {
//     connection.query(
//       "DELETE FROM user_info WHERE id = ?",
//       [req.params.id],
//       (err, results) => {
//         return res.redirect("/webboard");
//       }
//     );
//   });
  

  
  
//   // week2 for encypt
  
//   app.get("/signup", (req,res) => {
//     res.render("signup.ejs");
//   });
  
//   app.post("/signup", (req,res) => {
//     const newuser_username = req.body.user_username;
//     const newuser_email = req.body.user_email;
//     const newuser_password = req.body.user_password;
  
//     console.log(newuser_username);
  
//     // const bcrypt = require('bcrypt');
  
//     // Assuming newuser_username, newuser_password, and newuser_email are already defined.
    
//     if (newuser_username && newuser_password) {
//       bcrypt.genSalt(10, function(err, salt) {
//         console.log(salt);
//         console.log(newuser_username, newuser_email, newuser_password);
//         bcrypt.hash(newuser_password, salt, function(err, hash) {  // Fixed typo here
//           connection.query(
//             "INSERT INTO user_info SET user_username = ?, user_password = ?, user_email = ?",
//             [newuser_username, hash, newuser_email],  // Fixed variable name here
//             function(err) {
//               if (err) {
//                 console.error(err);  // Print the actual error message
//               }
    
//               req.session.loggedin = true;
//               req.session.userID = newuser_username;
    
//               res.redirect("/checklogin");
//             }
//           );
//         });
//       });
//     } else {
//       res.redirect('/');
//     }
//   });
  
//   //checkemail
//   app.post("/checkLogin", function(req,res) {
//     var newuser_username     = req.body.user_username;
//    var newuser_password   = req.body.user_password;
  
//       if (newuser_username && newuser_password) {
//           connection.query(
//               "SELECT * FROM user_info WHERE user_username = ?", newuser_username,
//               function(err, results) {
//                   if (err) { console.error(); }
  
//                   if (results.length > 0) {
//                       bcrypt.compare(newuser_password, results[0].user_password, function(err, resultt) {
//                           if (resultt == true) {
//                               req.session.loggedin    = true;
//                               req.session.userID      = results[0].user_username;
                              
//                               console.log(newuser_password, results[0].user_password);
//                               console.log(resultt);
//                               res.redirect("/webboard");
//                           }
//                           else {
//                               res.render("index_error", {
//                                   message : "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
//                                   user_id  : newuser_username
//                               });
//                           }
//                       });
//                   } else {
//                       res.render("index_error", {
//                           message     : "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง<br>(หากยังไม่เคยใช้งานเว็บไซต์นี้ ให้สมัครสมาชิกก่อน)",
//                           user_id     : newuser_username
//                       });
//                   }
//               }
//           );
//    } else {
//           res.render("index_error", {
//               message : "โปรดใส่ข้อมูลให้ครบถ้วน!!",
//               user_id  : newuser_username
//           });
//    }
//   });
  
//   app.get("/checkLogin", function(req,res) {
//     res.sendFile(path.join(__dirname + "/login_auth.html"));
//   });
  
  
  
  
  
  
  
  
  
  
  
//   // Send Email
//   /* ---------- config สำหรับ gmail ---------- */
//   function sendmail(toemail, subject, html) {
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         service: 'gmail',  
//         auth: {
//             user: 'partykung2306@gmail.com',   // your email
//             //pass: 'Sittichai7749!'  // your email password
//              pass: 'coazbwcmapfayzex'    // for app password
//         }
//     });
    
//     // send mail with defined transport object
//     let mailOptions = {
//         from: '"COSCI - Test mail" <partykung2306@gmail.com>',  // sender address
//         to: toemail,    // list of receivers
//         subject: subject,   // Subject line
//         // text: textMail
//         html: html     // html mail body
//     };
  
//     // send mail with defined transport object
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log(error);
//             res.send('เกิดข้อผิดพลาด ไม่สามารถส่งอีเมลได้ โปรดลองใหม่ภายหลัง');
//         }
//         else {
//             // console.log('INFO EMAIL:', info);
//             console.log("send email successful");
//         }
//     });
//   }
  
  
//   //checkforget
//   app.get("/checkForget", function(request, response) {
//     response.sendFile(path.join(__dirname + "/login_forget.html"));
//   });
  
//   app.post("/checkForget", function(req, res) {
//     var newuser_username    = req.body.user_username;
//     console.log(newuser_username);
  
//     if (newuser_username) {
//         connection.query(
//             "SELECT * FROM user_info WHERE user_username = ?", newuser_username, 
//             function(errM, rowM) {
//                 if (errM) {console.error();}
  
//                 if (rowM.length > 0) {
//                     // ส่งอีเมล
//                     let randomPass = Math.random().toString(36).substring(2, 10);
  
//                     var emails = rowM[0].user_email;
//                     var subject = "รหัสผ่านของคุณมีการเปลี่ยนแปลง";
//                     var html = "สวัสดี คุณ " + rowM[0].user_username + "<br><br>" +
//                         "&nbsp;&nbsp;รหัสผ่านเว็บไซต์ NodeLoginX ของคุณมีการเปลี่ยนแปลงตามที่คุณร้องขอ<br>" + 
//                         "รหัสผ่านใหม่ของคุณ คือ &nbsp;" + randomPass + "<br>" +
//                         "ให้ใช้รหัสผ่านนี้ในการเข้าสู่ระบบ และคุณสามารถเปลี่ยนแปลงรหัสผ่านของคุณได้หลังจากเข้าสู่ระบบแล้ว" + "<br><br><br>ขอบคุณ<br>NodeLoginX";
//                     sendmail(emails, subject, html);
//                     console.log(emails);
  
//                     // Update Password
//                     bcrypt.genSalt(10, function(err, salt) {
//                         bcrypt.hash(randomPass, salt, function(err, hash) {
//                             connection.query(
//                                 "UPDATE user_info SET user_password = ? WHERE user_username = ?", [hash, newuser_username],
//                                 function(err) {
//                                     if (err) {console.error();}
  
//                                     const textMSG = 'เราจะส่งรหัสผ่านไปให้คุณทางอีเมล "' + rowM[0].user_email + '"<br>โปรดตรวจสอบรหัสใหม่ที่อีเมลของคุณ';
//                                     res.render("index_forgotpass", {
//                                         message     : textMSG,
//                                         user_name   : newuser_username,
//                                         vhf1        : 'hidden',
//                                         vhf2        : 'visible'
//                                     });
//                                 }
//                             );
//                         });
//                     });
//                 }
//                 else {
//                     res.render("index_forgotpass", {
//                         message     : "ขออภัย..ไม่พบข้อมูล<br>คุณอาจยังไม่เป็นสมาชิก",
//                         user_name     : newuser_username,
//                         vhf1        : 'visible',
//                         vhf2        : 'hidden'
//                     });
//                 }
//             }
//         );
//     } else {
//         res.render("index_forgotpass", {
//             message     : "โปรดใส่ข้อมูลก่อน!!",
//             vhf1        : 'visible',
//             vhf2        : 'hidden'
//         });
//     }
//   });


