const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI,{
    dbName:"strivenp"
})
.then(()=>{
    console.log("Connected to the database");
})
.catch((err)=>{
    console.log("Error connecting to the database",err);
});

module.exports = mongoose.connection;