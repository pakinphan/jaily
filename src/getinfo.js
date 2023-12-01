const User = require('')

module.exports = async (req, res) => {

        let UserData = await User.findById(req.session.userId)

        res.render('index', {
            user_username
        })
}