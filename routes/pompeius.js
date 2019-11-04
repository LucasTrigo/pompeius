const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { eProf } = require('../helpers/eProf')
require("../models/Sala")
const Sala = mongoose.model("Sala")
require("../models/Aluno")
const Aluno = mongoose.model("Aluno")

router.get('/', (req, res)=>{
    res.render('pompeius/index')
})

router.get('/inicio', eProf, (req, res)=>{
    res.render('pompeius/inicio')
})

router.get('/join-game', (req, res)=>{
    res.render('pompeius/joingame')
})

router.post('/in-game', (req, res)=>{
    Sala.findOne({idRoom: req.body.codigoroom}).then((sala)=>{
        if(sala && sala.isOnline == true){
            Aluno.findOne({nome: req.body.nomealuno, roomNow: req.body.codigoroom}).then((aluno)=>{
                if(aluno){
                    req.flash('error_msg', "Já existe um Aluno com esse nome!")
                    res.redirect('/pompeius/join-game')
                }
                else{
                    const newAluno = new Aluno({
                        nome: req.body.nomealuno,
                        roomNow: sala.idRoom
                    })

                    newAluno.save().then(()=>{
                        res.redirect('/pompeius/lobby')
                    }).catch((err)=>{
                        req.flash('error_msg', "erro interno newaluno")
                        res.redirect('/pompeius/join-game')
                    })
                }
            })
        }
        else{
            req.flash('error_msg', "Esse código é inválido ou a sala já foi encerrada.")
            res.redirect('/pompeius/join-game')
        }
    }).catch((err)=>{
        req.flash('error_msg', "Erro interno buscar sala")
        res.redirect('/pompeius/join-game')
    })
})

router.get('/lobby', (req, res)=>{
    res.render('pompeius/lobby')
})

router.get('/room-close/:id', eProf, (req, res)=>{
    Sala.findOne({_id: req.params.id}).then((sala)=>{
        if(sala){
            sala.isOnline = false

            sala.save().then(()=>{
                req.flash('success_msg', "Sala fechada com sucesso!")
                res.redirect('/pompeius/inicio')
            }).catch((err)=>{
                req.flash('error_msg', "Erro ao encerrar sala")
                res.redirect('/pompeius/inicio')
            })
        }
        else{
            req.flash('error_msg', "Sala não encontrada!!")
            res.redirect('/pompeius/inicio')
        }
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao fechar sala")
        res.redirect('/pompeius/inicio')
        console.log(err)
    })
})

module.exports = router