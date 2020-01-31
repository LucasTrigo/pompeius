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
    },
    erros:{
        type: Number
    },
    eAluno:{
        type: Number,
        default: 1
    },
    tempo_enigma:{
        type: Date
    }
})

mongoose.model("Aluno", Aluno)