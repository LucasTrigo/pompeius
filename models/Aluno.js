const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Aluno = new Schema({
    nome:{
        type: String,
        required: true
    },
    roomNow:{
        type: String,
        required: true
    }
})

mongoose.model("Aluno", Aluno)