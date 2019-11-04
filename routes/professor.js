const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const passport = require('passport')
require("../models/Professor")
const Professor = mongoose.model("professores")
require("../models/Sala")
const Sala = mongoose.model("Sala")
const { eProf } = require('../helpers/eProf')

router.get('/', eProf, (req, res) => {
    res.send("Pagina principal do Professor")
})

router.get('/add', (req, res) => {
    res.render('professor/addprofessor')
})


router.post('/novo', (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Preencha o campo Nome com seu Nome" })
    }
    if (req.body.nome.length > 50) {
        erros.push({ texto: "Nome não pode ser maior que 50 caracteres! Tente novamente." })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido!" })
    }
    if (!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        erros.push({ texto: "Preencha o campo senha com sua senha!" })
    }
    if (req.body.password.length < 6) {
        erros.push({ texto: "Senha muito curta! mínimo de 6 caracteres." })
    }
    if (req.body.password != req.body.passwordConfirm) {
        erros.push({ texto: "As senhas não correspondem" })
    }

    if (erros.length > 0) {
        res.render('professor/addprofessor', { erros: erros })
    }
    else {

        Professor.findOne({ mail: req.body.email }).then((professores) => {
            if (professores) {
                req.flash('error_msg', "Já existe um usuário cadastrado com esse email!")
                res.redirect('/professor/add')
            }
            else {

                const novoProfessor = new Professor({
                    nome: req.body.nome,
                    mail: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoProfessor.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', "Houve um erro no salvamento! ")
                            res.redirect('/pompeius')
                        }

                        novoProfessor.password = hash

                        novoProfessor.save().then(() => {
                            req.flash('success_msg', "Cadastro realizado com sucesso!")
                            res.redirect('/professor/login')
                        }).catch((err) => {
                            req.flash('error_msg', "Erro interno")
                            res.redirect('/pompeius')
                            console.log(err)
                        })
                    })
                })
            }
        })
    }
})

router.get('/login', (req, res) => {
    res.render('professor/loginprofessor')
})

router.post('/efetuarlogin', (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/pompeius/inicio",
        failureRedirect: "/professor/login",
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', eProf, (req, res) => {
    req.logOut()
    res.redirect('/pompeius')
})

router.get('/edit', eProf, (req, res) => {
    res.render('professor/editprofessor')
})

router.post('/editprocess', eProf, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Preencha o campo Nome!" })
    }
    if (req.body.nome.length > 50) {
        erros.push({ texto: "Nome não pode ser maior que 50 caracteres!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Preencha o campo E-mail" })
    }
    if (erros.length > 0) {
        res.render('professor/editprofessor', { erros: erros })
    }
    else {

        if(req.user.mail != req.body.email){
            Professor.findOne({mail: req.body.email}).then((professor)=>{
                if(professor){
                    req.flash('error_msg', "E-mail em uso!")
                    res.redirect('/professor/edit')
                }
                else{
                    Professor.findOne({_id: req.body.id}).then((professor)=>{
                        professor.nome = req.body.nome
                        professor.mail = req.body.email

                        professor.save().then(()=>{
                            req.flash('success_msg', "Alterações salvas com sucesso!")
                            res.redirect('/pompeius/inicio')
                        }).catch((err)=>{
                            req.flash('error_msg', "erro ao salvar 1")
                            res.redirect('/pompeius/inicio')
                            console.log(err)
                        })
                    }).catch((err)=>{
                        req.flash('error_msg', "Erro interno")
                        res.redirect('/pompeius/inicio')
                        console.log(err)
                    })
                }
            })
        }
        else{
            Professor.findOne({_id: req.body.id}).then((professor)=>{
                professor.nome = req.body.nome

                professor.save().then(()=>{
                    req.flash('success_msg', "Alterações salvas com sucesso!")
                    res.redirect('/pompeius/inicio')
                }).catch((err)=>{
                    req.flash('error_msg', "Erro ao salvar 2")
                    res.redirect('/pompeius/inicio')
                    console.log(err)
                })
            })
        }

    }

})

router.get('/enigma1', eProf, (req, res) => {
    res.render('pompeius/leiaurea')
})

router.post('/enigma1/teste', eProf, (req, res) => {
    if (!req.body.resposta || typeof req.body.resposta == undefined || req.body.resposta == null) {
        req.flash('error_msg', "Preencha o campo resposta!")
        res.redirect('/professor/enigma1')
    }
    else if (req.body.resposta == "Lei Aurea" || req.body.resposta == "Lei Áurea" || req.body.resposta == "lei aurea" || req.body.resposta == "lei áurea") {
        req.flash('success_msg', "Parabéns! Resposta correta!")
        res.redirect('/pompeius/inicio')
    }
    else {
        req.flash('error_msg', "Resposta incorreta")
        res.redirect('/professor/enigma1')
    }
})

router.get('/password-save', (req, res)=>{
    res.render('professor/passwordforot')
})

router.post('/password-forgot', (req, res)=>{
    
    Professor.findOne({mail: req.body.savemail}).then((professor)=>{

        if(professor){
            const token = crypto.randomBytes(5).toString('hex')

            const now = new Date()
            now.setHours(now.getHours() + 1)

            Professor.findByIdAndUpdate(professor.id, {
                '$set':{
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            })
            console.log(token + "|||" + now)
        }
        else{
            req.flash('error_msg', "Conta não encontrada!")
            res.redirect('/professor/password-save')
        }

    }).catch((err)=>{
        req.flash('error_msg', "Usuário não encontrato!")
        res.redirect('/pompeius')
        console.log(err)
    })

})

router.get('/room', eProf, (req, res)=>{
    Sala.findOne({createdBy: req.user._id}).sort({$natural:-1}).then((sala)=>{
        if(sala){
            res.render('pompeius/room', {sala})
        }
        else{
            console.log("Teste 2")
        }
    }).catch((err)=>{
        req.flash('error_msg', 'erro ao criar sala')
        res.redirect('/professor/room')
    })

   
})

router.get('/create-room', eProf, (req, res)=>{
    res.render('professor/createroom')
})

router.get('/room-start', eProf, (req, res)=>{
    //var roomId = Math.floor(Math.random() * 8000 + 1000)
    
    const newRoom = new Sala({
        idRoom: Math.floor(Math.random() * 8000 + 1000),
        createdBy: req.user._id
    })

    newRoom.save().then(()=>{
        req.flash('success_msg', "Sala criada com sucesso!")
        res.redirect('/professor/room')
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao criar sala")
        res.redirect('/professor/create-room')
        console.log(err)
    })

})

router.get('/professores', (req, res) => {
    Professor.find().then((professores) => {
        res.render('professor/professores', { professores: professores })
    }).catch((err) => {
        console.log("Erro ao listar professores: " + err)
    })
})

module.exports = router