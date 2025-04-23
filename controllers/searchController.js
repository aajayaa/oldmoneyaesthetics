const Product = require('../models/Product');
const getSearch = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.redirect('/');
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        res.render('pages/search', {
            products,
            searchQuery,
            title: `Search Results for "${searchQuery}"`
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).render('error', { error: 'An error occurred while searching' });
    }
}

module.exports = {
    getSearch
};