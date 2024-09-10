const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URL)

    .then(() => {
        console.log("Database connected Successfully !")
    }).catch((e) => {
        console.log(e)
    })