const getHome = (req, res) => {
    res.render('pages/home', {
        user: req.user
    })
}
module.exports = {
    getHome 
}