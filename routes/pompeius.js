const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { eProf } = require('../helpers/eProf')
require("../models/Sala")
const Sala = mongoose.model("Sala")
require("../models/Aluno")
const Aluno = mongoose.model("Aluno")
const bcrypt = require('bcryptjs')
const passport = require('passport')
const fs = require('fs')
const puppeteer = require('puppeteer')
var tentativasErro = 0



router.get('/', (req, res) => {
    res.render('pompeius/index')
})

router.get('/inicio', eProf, (req, res) => {
    res.render('pompeius/inicio')
})

router.get('/join-game', (req, res) => {
    res.render('pompeius/joingame')
})

router.post('/in-game', (req, res) => {
    Sala.findOne({ idRoom: req.body.codigoroom }).then((sala) => {
        if (sala && sala.isOnline == true && sala.started == false) {
            Aluno.findOne({ nome: req.body.nomealuno, roomNow: req.body.codigoroom }).then((aluno) => {
                if (aluno) {
                    req.flash('error_msg', "Já existe um aluno com esse nome na sala")
                    res.redirect('/pompeius/join-game')
                }
                else {
                    const now = new Date()
                    now.setHours(now.getMinutes() + 1)

                    const newAluno = new Aluno({
                        nome: req.body.loginmail,
                        roomNow: sala.idRoom,
                        tempo_enigma: now
                    })



                    newAluno.save().then(() => {
                        res.render('pompeius/lobby', { sala })
                    }).catch((err) => {
                        req.flash('error_msg', "erro interno ")
                        res.redirect('/pompeius/join-game')
                        console.log(err)
                    })
                }
            })
        }
        else {
            req.flash('error_msg', "Não é possível entrar. Essa sala já foi iniciada ou já foi encerrada.")
            res.redirect('/pompeius/join-game')
        }
    }).catch((err) => {
        req.flash('error_msg', "Código de sala inválido")
        res.redirect('/pompeius/join-game')
    })
})

router.get('/lobby', (req, res, ) => {
    res.render('pompeius/lobby')
})

router.get('/relatorio/:id', (req, res) => {

    Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala) {
            Aluno.findOne({ roomNow: sala.idRoom }).then((aluno) => {
                res.render('pompeius/relatorio', { sala: sala, aluno: aluno })
                console.log(aluno)
            })
        }
    })


    /*Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala) {
            res.render('pompeius/relatorio', { sala })
        }
    }).catch((err) => {
        console.log(err)
    })*/
})

router.get('/room-close/:id', eProf, (req, res) => {
    Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala) {


            (async () => {
                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                })
                const page = await browser.newPage()

                //await page.goto('http://localhost:9091/pompeius/relatorio/' + sala._id)
                await page.goto('http://pompeius.herokuapp.com/pompeius/relatorio/' + sala._id)
                await page.pdf({ path: sala.idRoom + '.pdf', format: 'A4' })

                await browser.close()
            })();

            sala.isOnline = false

            sala.save().then(() => {
                req.flash('success_msg', "Sala encerrada")
                res.redirect('/pompeius/inicio')
            }).catch((err) => {
                res.redirect('/pompeius/inicio')
                req.flash('error_msg', "Erro ao encerrar sala")
            })
        }
        else {
            req.flash('error_msg', "Sala não encontrada!!")
            res.redirect('/pompeius/inicio')
        }
    }).catch((err) => {
        req.flash('error_msg', "Erro ao encerrar sala")
        res.redirect('/pompeius/inicio')
        console.log(err)
    })
})

router.get('/sobre', (req, res) => {
    res.render('pompeius/about')
})

router.get('/enigma1/:id', (req, res) => {
    Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala) {
            Aluno.findOne({ roomNow: sala.idRoom }).sort({ $natural: -1 }).then((aluno) => {
                if (aluno) {
                    res.render('pompeius/leiaureaAluno', { aluno })
                    console.log(aluno.nome)
                }
            })
        }
    }).catch((err) => {
        console.log(err)
    })

    //res.render('pompeius/leiaureaAluno')
})

router.post('/enigma1/res', (req, res, next) => {
    var erros = []


    Aluno.findOne({ _id: req.body.idAluno }).then((aluno) => {

        if (aluno) {
            Sala.findOne({ idRoom: aluno.roomNow }).then((sala) => {

                if (sala && sala.isOnline == true) {

                    if (!req.body.resliberdade || typeof req.body.resliberdade == undefined || req.body.resliberdade == null) {
                        res.render('pompeius/leiaureaAluno', { aluno })
                        //req.flash('error_msg', "Preencha o campo respostas")
                        console.log("Preencha o campo")
                    }
                    if (req.body.resliberdade == "Lei Aurea" || req.body.resliberdade == "Lei Áurea" || req.body.resliberdade == "lei aurea" || req.body.resliberdade == "lei áurea") {
                        if (sala.enigma2 == "on") {
                            res.render('pompeius/piAluno', { aluno })
                            //req.flash('success_msg', "Resposta correta! O próximo enigma já começou...")
                            //res.redirect('/pompeius/vezes10x0')
                            //console.log("Resposta correta 1")


                            aluno.erros = tentativasErro
                            aluno.save().then(() => {
                                console.log('Salvo erros')
                            }).catch((err) => {
                                console.log(err)
                            })
                        }
                        else if (sala.enigma3 == "on") {
                            res.render('pompeius/renascimentoAluno', { aluno })
                            //req.flash('success_msg', "Resposta correta! O próximo enigma já começou...")
                            console.log("Resposta correta 2")


                            aluno.erros = tentativasErro
                            aluno.save().then(() => {
                                console.log('Salvo erros')
                            }).catch((err) => {
                                console.log(err)
                            })
                        }
                        else {
                            res.render('pompeius/fimdesala')
                            console.log("Resposta correta 3")

                            aluno.erros = tentativasErro
                            aluno.save().then(() => {
                                console.log('Salvo erros')
                            }).catch((err) => {
                                console.log(err)
                            })
                        }
                    }
                    else {
                        erros.push({ message: "Resposta incorreta" })

                        tentativasErro = tentativasErro + 1

                        aluno.erros = tentativasErro
                        aluno.save().then(() => {
                            console.log('Salvo erros')
                        }).catch((err) => {
                            console.log(err)
                        })

                        console.log(tentativasErro)
                        console.log("Resposta incorreta")
                        res.render('pompeius/leiaureaAluno', { aluno: aluno, erros: erros })

                    }

                }
                else {
                    res.render('pompeius/ops')
                }

            }).catch((err) => {
                console.log(err)
            })
        }

    }).catch((err) => {
        console.log(err)
    })

})

router.get('/enigma3/:id', (req, res) => {
    Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala) {
            Aluno.findOne({ roomNow: sala.idRoom }).sort({ $natural: -1 }).then((aluno) => {
                if (aluno) {
                    res.render('pompeius/renascimentoAluno', { aluno })
                    console.log(aluno.nome)
                }
            })
        }
    }).catch((err) => {
        console.log(err)
    })

    //res.render('pompeius/renascimento')
})

router.post('/enigma3/res', (req, res) => {
    var erros = []

    Aluno.findOne({ _id: req.body.idAluno }).then((aluno) => {
        if (aluno) {
            Sala.findOne({ idRoom: aluno.roomNow }).then((sala) => {
                if (sala && sala.isOnline == true) {
                    if (!req.body.resren || typeof req.body.resren == undefined || req.body.resren == null) {
                        res.render('pompeius/renascimentoAluno', { aluno })
                        console.log("Preencha o campo resposta")
                    }
                    if (req.body.resren == "Renascimento" || req.body.resren == "renascimento" || req.body.resren == "RENASCIMENTO") {
                        res.render('pompeius/fimdesala', { aluno })


                        aluno.erros = tentativasErro
                        aluno.save().then(() => {
                            console.log('Salvo erros')
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                    else {
                        erros.push({ message: "Resposta incorreta" })

                        tentativasErro = tentativasErro + 1

                        aluno.erros = tentativasErro
                        aluno.save().then(() => {
                            console.log('Salvo erros')
                        }).catch((err) => {
                            console.log(err)
                        })

                        res.render('pompeius/renascimentoAluno', { aluno: aluno, erros: erros })
                        console.log("Resposta incorreta")
                    }
                }
                else {
                    res.render('pompeius/ops')
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }).catch((err) => {
        console.log(err)
    })

})

router.get('/enigma2/:id', (req, res) => {
    Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala) {
            Aluno.findOne({ roomNow: sala.idRoom }).sort({ $natural: -1 }).then((aluno) => {
                if (aluno) {
                    res.render('pompeius/piAluno', { aluno })
                    console.log(aluno.nome)
                }
            })
        }
    }).catch((err) => {
        console.log(err)
    })

    //res.render('pompeius/piAluno')
})


router.post('/enigma2/res', (req, res) => {

    var erros = []

    Aluno.findOne({ _id: req.body.idAluno }).then((aluno) => {

        if (aluno) {

            Sala.findOne({ idRoom: aluno.roomNow }).then((sala) => {
                if (sala && sala.isOnline == true) {

                    if (!req.body.respi || typeof req.body.respi == undefined || req.body.respi == null) {
                        res.render('pompeius/piAluno', { aluno })
                    }
                    if (req.body.respi == "Zero" || req.body.respi == "zero" || req.body.respi == "ZERO" || req.body.respi == "0") {
                        if (sala.enigma3 == "on") {
                            res.render('pompeius/renascimentoAluno', { aluno })
                            aluno.erros = tentativasErro
                            aluno.save().then(() => {
                                console.log('Salvo erros')
                            }).catch((err) => {
                                console.log(err)
                            })
                        }
                        else {
                            res.render('pompeius/fimdesala')
                            aluno.erros = tentativasErro
                            aluno.save().then(() => {
                                console.log('Salvo erros')
                            }).catch((err) => {
                                console.log(err)
                            })
                        }
                    }
                    else {
                        erros.push({ message: "Resposta incorreta" })

                        tentativasErro = tentativasErro + 1
                        aluno.erros = tentativasErro
                        aluno.save().then(() => {
                            console.log('Salvo erros')
                        }).catch((err) => {
                            console.log(err)
                        })

                        res.render('pompeius/piAluno', { aluno: aluno, erros: erros })
                        console.log("Resposta incorreta")
                    }

                }
                else {
                    res.render('pompeus/ops')
                }
            }).catch((err) => {
                console.log(err)
            })

        }

    }).catch((err) => {
        console.log(err)
    })

})



module.exports = router