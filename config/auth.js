const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/Professor')
const Professor = mongoose.model('professores')


module.exports = function(passport){

    passport.use(new localStrategy({usernameField: "loginmail", passwordField: "senha"}, (email, password, done)=>{
        Professor.findOne({mail: email}).then((professor)=>{
            if(!professor){
                return done(null, false, {message: "Conta não encontrada! Tente novamente."})
            }

            bcrypt.compare(password, professor.password, (erro, batem)=>{
                if(batem){
                    return done(null, professor)
                }else{
                    return done(null, false, {message: "Senha incorreta! Tente novamente."})
                }
            })
        })
    }))

    passport.serializeUser((professor, done)=>{
        done(null, professor.id)
    })

    passport.deserializeUser((id, done) => {
        Professor.findById(id, (err, professor)=>{
            done(err, professor)
        })
    })

}