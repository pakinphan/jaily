
router.get("/", async (req, res) => {
    try {
      const [users] = await dbConnection.execute('SELECT user_username FROM users');
      res.render('index', { users }); // Make sure 'users' is passed to the template
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Internal Server Error' });
    }
  });