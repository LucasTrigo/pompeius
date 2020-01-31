const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require("../models/Aluno")
const Aluno = mongoose.model("Aluno")

module.exports = function(passport){

    passport.use(new localStrategy({usernameField: "nomealuno", passwordField: "codigoroom"}, (nome, password, done)=>{
        Aluno.findOne({nome: nome}).then((aluno)=>{
            if(!aluno){
                return done(null, false, {message: "Erro conta Aluno"})
            }

            bcrypt.compare(password, aluno.password, (erro, batem)=>{
                if(batem){
                    return done(null, aluno)
                }
                else{
                    return done(null, false, {message: "Códigod de sala incorreto"})
                }
            })
        })
    }))

    passport.serializeUser((aluno, done)=>{
        done(null, aluno.id)
    })

    passport.deserializeUser((id, done)=>{
        Aluno.findById(id, (err, aluno)=>{
            done(err, aluno)
        })
    })

}