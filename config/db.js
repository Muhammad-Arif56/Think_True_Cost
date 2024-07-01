const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/Think_True_Cost")

    .then(() => {
        console.log("Database connected Successfully !")
    }).catch((e) => {
        console.log(e)
    })