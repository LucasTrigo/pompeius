const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Professor = new Schema({
    nome: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        required: true
    },
    eProf: {
        type: Number,
        default: 1
    },
    password: {
        type: String,
        required: true
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires:{
        type: Date,
        select: false
    }

})

mongoose.model("professores", Professor)