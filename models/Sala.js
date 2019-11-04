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
    }
})

mongoose.model("Sala", Sala)