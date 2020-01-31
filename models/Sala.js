const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Sala = new Schema({
    idRoom:{
        type: Number,
        required: true
    },
    createdBy:{
        type: String,
        required: true        
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    isOnline:{
        type: Boolean,
        default: true
    },
    started:{
        type: Boolean,
        default: false
    },
    enigma1:{
        type: String,
        default: "off"
    },
    enigma2:{
        type: String,
        default: "off"
    },
    enigma3:{
        type: String,
        default: "off"
    }
})

mongoose.model("Sala", Sala)