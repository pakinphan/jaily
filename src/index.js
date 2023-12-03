const express = require("express");
const path = require('path');
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
var router = express.Router();

const dbConnection = require('./database');
const { body, validationResult } = require('express-validator');
const session = require("express-session");


const app = express();
app.use(express.urlencoded({ extended: false }))

app.use('/assets', express.static('assets'))

app.get('/register', (req, res) => {
    // Render the "register.ejs" view
    res.render('register');
});
app.get('/login', (req, res) => {

    res.render('login');
});


app.get('/error', (req, res) => {

    res.render('error');
});








app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
    cookieSession({
        name: 'session',
        keys: ['key1', 'key2'],
        maxAge: 3600 * 1000 //1hour
    })
);

app.get("/", async (req, res) => {
    try {
        const [stories] = await dbConnection.execute("SELECT * FROM contents_new LIMIT 4;");
        const [query] = await dbConnection.execute('SELECT * FROM contents_new ORDER BY content_id DESC LIMIT 4');
        const [result_story] = await dbConnection.execute("SELECT COUNT(*) AS totalRows FROM contents_new;");
        const totalRows = result_story[0].totalRows;
        const [result_reader] = await dbConnection.execute("SELECT COUNT(*) AS totalRows_r FROM users;");
        const totalRows_r = result_reader[0].totalRows_r;

        // Fetch user information based on the session username
        const user = req.session?.user_username
            ? await dbConnection.execute("SELECT * FROM users WHERE user_username = ?;", [req.session.user_username])
            : null;
        console.log(stories)
        // Pass the user information to the EJS file if needed
        res.render('index', {
            query: query,
            stories: stories,
            user: req.session.user_username, // Check if user is not null and has data
            session: req.session,
            totalRows: totalRows,
            totalRows_r: totalRows_r,
        });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

app.get("/browse", async (req, res) => {
    try {
        const [stories] = await dbConnection.execute("SELECT * FROM contents_new;");

        // Fetch user information based on the session username
        const user = req.session?.user_username
            ? await dbConnection.execute("SELECT * FROM users WHERE user_username = ?;", [req.session.user_username])
            : null;
        console.log(stories)
        // Pass the user information to the EJS file if needed
        res.render('browse', {
            stories: stories,
            user: req.session.user_username, // Check if user is not null and has data
            session: req.session,

        });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

app.get("/write", async (req, res) => {
    try {
        const [stories] = await dbConnection.execute("SELECT * FROM contents_new;");

        // Fetch user information based on the session username
        const user = req.session?.user_username
            ? await dbConnection.execute("SELECT * FROM users WHERE user_username = ?;", [req.session.user_username])
            : null;
        console.log(stories)
        // Pass the user information to the EJS file if needed
        res.render('write_page', {
            stories: stories,
            user: req.session.user_username, // Check if user is not null and has data
            session: req.session,

        });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

app.get("/howto", async (req, res) => {
    try {
        const [stories] = await dbConnection.execute("SELECT * FROM contents_new;");

        // Fetch user information based on the session username
        const user = req.session?.user_username
            ? await dbConnection.execute("SELECT * FROM users WHERE user_username = ?;", [req.session.user_username])
            : null;
        console.log(stories)
        // Pass the user information to the EJS file if needed
        res.render('howto', {
            stories: stories,
            user: req.session.user_username, // Check if user is not null and has data
            session: req.session,

        });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});


app.get("/tnc", async (req, res) => {
    try {
        const [stories] = await dbConnection.execute("SELECT * FROM contents_new;");

        // Fetch user information based on the session username
        const user = req.session?.user_username
            ? await dbConnection.execute("SELECT * FROM users WHERE user_username = ?;", [req.session.user_username])
            : null;
        console.log(stories)
        // Pass the user information to the EJS file if needed
        res.render('tnc', {
            stories: stories,
            user: req.session.user_username, // Check if user is not null and has data
            session: req.session,

        });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});




app.get('/read/:id', async (req, res) => {
    try {
        // Fetch the content from the database based on the ID
        const contentId = req.params.id;
        const [content] = await dbConnection.execute('SELECT * FROM contents_new WHERE content_id = ?', [contentId]);
        const [stories] = await dbConnection.execute("SELECT * FROM contents_new LIMIT 4;");
        const user = req.session?.user_username
            ? await dbConnection.execute("SELECT * FROM users WHERE user_username = ?;", [req.session.user_username])
            : null;
        console.log(content)
        res.render('read_page', {
            content: content[0],
            stories: stories, user: req.session.user_username, // Check if user is not null and has data
            session: req.session,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post("/save-content", async (req, res) => {
    try {
        // Extract data from the form submission
        const { content_cover, content_title, content_description, content_category1, content_category2, content_location1, content_paragraph1, content_image1, content_location2, content_paragraph2, content_image2, content_location3, content_paragraph3, content_image3, content_location4, content_paragraph4, content_image4, content_location5, content_paragraph5, content_image5, content_location6, content_paragraph6, content_image6, content_location7, content_paragraph7, content_image7, content_location8, content_paragraph8, content_image8, content_location9, content_paragraph9, content_image9, content_location10, content_paragraph10, content_image10 } = req.body;
        console.log({ content_cover, content_title, content_description, content_category1, content_category2, content_location1, content_paragraph1, content_image1, content_location2, content_paragraph2, content_image2, content_location3, content_paragraph3, content_image3 })
        // Perform validation if needed

        // Insert data into the database
        const result = await dbConnection.query(
            "INSERT INTO contents_new (content_cover, content_title, content_description, content_category1, content_category2, content_location1, content_paragraph1, content_image1, content_location2, content_paragraph2, content_image2, content_location3, content_paragraph3, content_image3, content_location4, content_paragraph4, content_image4, content_location5, content_paragraph5, content_image5, content_location6, content_paragraph6, content_image6, content_location7, content_paragraph7, content_image7, content_location8, content_paragraph8, content_image8, content_location9, content_paragraph9, content_image9, content_location10, content_paragraph10, content_image10) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [content_cover, content_title, content_description, content_category1, content_category2, content_location1, content_paragraph1, content_image1, content_location2, content_paragraph2, content_image2, content_location3, content_paragraph3, content_image3, content_location4, content_paragraph4, content_image4, content_location5, content_paragraph5, content_image5, content_location6, content_paragraph6, content_image6, content_location7, content_paragraph7, content_image7, content_location8, content_paragraph8, content_image8, content_location9, content_paragraph9, content_image9, content_location10, content_paragraph10, content_image10]
        );
        
        console.log({
            content_cover, content_title, content_description, 
            content_category1, content_category2, 
            content_location1, content_paragraph1, content_image1, 
            content_location2, content_paragraph2, content_image2, 
            content_location3, content_paragraph3, content_image3
          });
        res.redirect("/");
        // Check the affectedRows to verify if the data was inserted successfully
        if (result.affectedRows > 0) {
            // Data inserted successfully
            res.redirect("/"); // Redirect to the index page or any other page
        } else {
            // Data insertion failed
            res.render("error", { message: "Failed to save content" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
});



module.exports = router;

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
            req.session.user_username = user[0].user_username; // <-- Set the correct session key

            // Redirect to /index after successful login
            return res.redirect('/');
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





app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});



const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));



