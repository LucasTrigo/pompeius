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
const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const path = require('path')
const hbs = require('handlebars')
const moment = require('moment')
const mailer = require('../config/nodemailer')

const dataProf = function () {
    Professor.find().then((professores) => {
        return professores
    }).catch((err) => {
        console.log("Erro ao listar professores: " + err)
    })

}

const compile = async function (templateName, data) {

    const filePath = path.join(process.cwd(), 'professor', `${professor}.hbs`)
    const html = await fs.readFile(filePath)

    return hbs.compile(html)(data)
}

hbs.registerHelper('dateFormat', function (value, format) {
    return moment(value).format(format)
})

router.get('/', eProf, (req, res) => {
    res.send('ERRO 404 P18')
})

router.get('/add', (req, res) => {
    res.render('professor/addprofessor')
})


router.post('/novo', (req, res, next) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome: campo obrigatório" })
    }
    if (req.body.nome.length > 50) {
        erros.push({ texto: "Nome não pode ser maior que 50 caracteres! Tente novamente." })
    }
    if (!req.body.loginmail || typeof req.body.loginmail == undefined || req.body.loginmail == null) {
        erros.push({ texto: "E-mail inválido!" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha: campo obrigatório" })
    }
    if (req.body.senha.length < 6) {
        erros.push({ texto: "Senha deve ter no mínimo 6 caracteres" })
    }
    if (req.body.senha != req.body.passwordConfirm) {
        erros.push({ texto: "As senhas não correspondem" })
    }

    if (erros.length > 0) {
        res.render('professor/addprofessor', { erros: erros })
    }
    else {

        Professor.findOne({ mail: req.body.loginmail }).then((professores) => {
            if (professores) {
                req.flash('error_msg', "E-mail já cadastrado")
                res.redirect('/pompeius/professor/add')
            }
            else {

                const novoProfessor = new Professor({
                    nome: req.body.nome,
                    mail: req.body.loginmail,
                    password: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoProfessor.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', "Erro interno")
                            res.redirect('/pompeius')
                        }

                        novoProfessor.password = hash

                        novoProfessor.save().then(() => {
                            req.flash('success_msg', "Cadastro realizado com sucesso!")
                            passport.authenticate("local", {
                                successRedirect: "/pompeius/inicio",
                                failureRedirect: "/pompeius/professor/login",
                                failureFlash: true
                            })(req, res, next)
                            //res.redirect('/pompeius/inicio')
                        }).catch((err) => {
                            req.flash('error_msg', "Erro interno. Não foi possível salvar")
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
        failureRedirect: "/pompeius/professor/login",
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
        erros.push({ texto: "Nome: campo obrigatório" })
    }
    if (req.body.nome.length > 50) {
        erros.push({ texto: "Nome não pode ser maior que 50 caracteres!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail: campo obrigatório" })
    }
    if (erros.length > 0) {
        res.render('professor/editprofessor', { erros: erros })
    }
    else {

        if (req.user.mail != req.body.email) {
            Professor.findOne({ mail: req.body.email }).then((professor) => {
                if (professor) {
                    req.flash('error_msg', "Esse e-mail já esta em uso!")
                    res.redirect('/pompeius/professor/edit')
                }
                else {
                    Professor.findOne({ _id: req.body.id }).then((professor) => {
                        professor.nome = req.body.nome
                        professor.mail = req.body.email

                        professor.save().then(() => {
                            req.flash('success_msg', "Alterações salvas com sucesso!")
                            res.redirect('/pompeius/inicio')
                        }).catch((err) => {
                            req.flash('error_msg', "Erro ao salvar alterações")
                            res.redirect('/pompeius/inicio')
                            console.log(err)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', "Erro interno")
                        res.redirect('/pompeius/inicio')
                        console.log(err)
                    })
                }
            })
        }
        else {
            Professor.findOne({ _id: req.body.id }).then((professor) => {
                professor.nome = req.body.nome

                professor.save().then(() => {
                    req.flash('success_msg', "Alterações salvas com sucesso!")
                    res.redirect('/pompeius/inicio')
                }).catch((err) => {
                    req.flash('error_msg', "Erro ao salvar alterações")
                    res.redirect('/pompeius/inicio')
                    console.log(err)
                })
            })
        }

    }

})

router.get('/vezes10x0', eProf, (req, res) => {
    res.render('pompeius/pi')
})

router.get('/enigmatizando', eProf, (req, res) => {
    res.render('pompeius/renascimento')
})

router.post('/enigmatizando/res', eProf, (req, res) => {
    if (!req.body.resren || typeof req.body.resren == undefined || req.body.resren == null) {
        req.flash('error_msg', "Preencha o campo Resposta")
        res.redirect('/pompeius/professor/enigmatizando')
    } else if (req.body.resren == "Renascimento" || req.body.resren == "renascimento" || req.body.resren == "RENASCIMENTO") {
        req.flash('success_msg', "Resposta correta!")
        res.redirect('/pompeius/inicio')
    }
    else {
        req.flash('error_msg', "Resposta inválida")
        res.redirect('/pompeius/professor/enigmatizando')
    }

})

router.post('/vezes10x0/res', eProf, (req, res) => {
    if (!req.body.respi || typeof req.body.respi == undefined || req.body.respi == null) {
        req.flash('error_msg', "Preencha o campo resposta")
        res.redirect('/pompeius/professor/vezes10x0')
    }
    else if (req.body.respi == "Zero" || req.body.respi == "zero" || req.body.respi == "ZERO" || req.body.respi == "0") {
        req.flash('success_msg', "Resposta correta!")
        res.redirect('/pompeius/inicio')
    }
    else {
        req.flash('error_msg', "Resposta inválida")
        res.redirect('/pompeius/professor/vezes10x0')
    }
})

router.get('/liberdade', eProf, (req, res) => {
    res.render('pompeius/leiaurea')
})

router.post('/liberdade/res', eProf, (req, res) => {
    if (!req.body.resliberdade || typeof req.body.resliberdade == undefined || req.body.resliberdade == null) {
        req.flash('error_msg', "Preencha o campo resposta!")
        res.redirect('/pompeius/professor/liberdade')
    }
    else if (req.body.resliberdade == "Lei Aurea" || req.body.resliberdade == "Lei Áurea" || req.body.resliberdade == "lei aurea" || req.body.resliberdade == "lei áurea") {
        req.flash('success_msg', "Resposta correta!")
        res.redirect('/pompeius/inicio')
    }
    else {
        req.flash('error_msg', "Resposta incorreta")
        res.redirect('/pompeius/professor/liberdade')
    }
})

router.get('/password-save', (req, res) => {
    res.render('professor/passwordforot')
})

router.post('/password-forgot', (req, res) => {

    Professor.findOne({ mail: req.body.savemail }).then((professor) => {

        if (professor) {
            const token = crypto.randomBytes(20).toString('hex')

            const now = new Date()
            now.setHours(now.getHours() + 1)

            Professor.findByIdAndUpdate(professor.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            })
            console.log(token + "|||" + now)

            mailer.sendMail({
                to: professor.mail,
                from: 'lucas.trigo98@gmail.com',
                template: '../mail/forgot_password',
                context: { token }
            }), (err) => {
                if (err) {
                    return res.sendStatus(400).send({ error: "Erro ao enviar e-mail para redefinir senha" })
                }

                return res.sendStatus()
            }

            res.render('professor/passwordForgotForm', { professor: professor })

        }
        else {
            req.flash('error_msg', "Conta não encontrada!")
            res.redirect('/pompeius/professor/password-save')
        }

    }).catch((err) => {
        req.flash('error_msg', "Usuário não encontrato!")
        res.redirect('/pompeius/professor/password-save')
        console.log(err)
    })

})

router.post('/password-reset', (req, res) => {
    var erros = []
    const now = Date.now();


    Professor.findOne({ mail: req.body.mail }).then((professor) => {

        if (professor.passwordResetToken != req.body.token) {
            //erros.push({ message: "Token informado não é válido" })
            //res.render('professor/passwordForgotForm', { professor: professor, erros: erros })
        }

        if (now > professor.passwordResetExpires) {
            erros.push({ message: "Token expirado. Tente gerar um novo token" })
            res.render('professor/passwordForgotForm', { professor: professor, erros: erros })
        }
        else {
            erros.push({ message: "Token validado com sucesso!" })
            res.render('professor/passwordForgotChange', { professor: professor, erros: erros })
        }

    }).catch((err) => {
        req.flash('error_msg', "Erro interno!")
        res.redirect('/pompeius')
    })

})

router.post('/password-reset-process', (req, res) => {
    var erros = []

    if (req.body.pass != req.body.confirmpass) {
        erros.push({ message: "Nova senha e confirme nova senha não batem" })
        res.render('professor/passwordForgotChange', { erros: erros })
    }
    if (req.body.pass.length < 6) {
        erros.push({ message: "Mínimo de 6 caracteres na nova senha" })
        res.render('professor/passwordForgotChange', { erros: erros })
    }
    else {

        Professor.findOne({ mail: req.body.mail }).then((professor) => {

            if(professor){
                professor.password = req.body.pass

                bcrypt.genSalt(10, (erro, salt)=>{
                    bcrypt.hash(professor.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Erro ao salvar nova senha! ERRO: 347-P')
                            res.redirect('/pompeius')
                            console.log('erro 352 hash')
                        }
                        else {
                            professor.password = hash

                            professor.save().then(() => {
                                req.flash('success_msg', "Senha alterada com sucesso!")
                                res.redirect('/pompeius')
                                console.log('senha alterada com sucesso!')
                            }).catch((err) => {
                                req.flash('error_msg', 'Erro ao salvar nova senha')
                                res.redirect('/pompeius')
                                console.log('erro ao alterar')
                            })
                        }
                    })
                })
            }

        }).catch((err)=>{
            req.flash('error_msg', "Erro interno")
            res.redirect('/pompeius')
            console.log(err)
        })
    }

})

router.get('/room', eProf, (req, res) => {
    Sala.findOne({ createdBy: req.user._id }).sort({ $natural: -1 }).then((sala) => {
        if (sala) {
            res.render('pompeius/room', { sala })
        }
        else {
            console.log("Teste 2")
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível criar a sala')
        res.redirect('/pompeius/professor/room')
    })


})

router.get('/create-room', eProf, (req, res) => {
    res.render('professor/createroom')
})

router.post('/room-start', eProf, (req, res) => {
    var enigmasChecked = []

    if (req.body.leiaurea) {
        enigmasChecked.push(1)
    }
    if (req.body.pi) {
        enigmasChecked.push(2)
    }
    if (req.body.renascimento) {
        enigmasChecked.push(3)
    }

    if (enigmasChecked.length > 0) {
        console.log({ enigmasChecked })

        const newRoom = new Sala({
            idRoom: Math.floor(Math.random() * 8000 + 1000),
            createdBy: req.user._id,
            enigma1: req.body.leiaurea,
            enigma2: req.body.pi,
            enigma3: req.body.renascimento
        })


        console.log(newRoom)

        newRoom.save().then(() => {
            req.flash('success_msg', "Sala criada com sucesso!")
            res.redirect('/pompeius/professor/room')
        }).catch((err) => {
            req.flash('error_msg', "Erro interno")
            res.redirect('/pompeius/inicio')
            console.log(err)
        })
    }
    else {
        req.flash('error_msg', "Nenhum enigma selecionado")
        res.redirect('/pompeius/inicio')
    }



})

router.get('/room-start/:id', eProf, (req, res) => {

    Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala) {
            sala.started = true

            sala.save().then(() => {
                req.flash('success_msg', "A sala foi iniciada")
                res.redirect('/pompeius/professor/room')
            }).catch((err) => {
                req.flash('error_msg', "Erro ao inicar sala")
                res.redirect('/pompeius/professor/room')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', "Erro interno")
        res.redirect('/pompeius/professor/room')
    })
})

router.get('/verificacao/:id', (req, res) => {

    Sala.findOne({ _id: req.params.id }).then((sala) => {
        if (sala.started == true) {
            res.render('pompeius/lobby', { sala })
        } else {
            res.render('pompeius/lobby', { sala })
        }
    }).catch((err) => {
        req.flash('error_msg', "Erro interno")
        res.redirect('/pompeius')
        console.log(err)
    })
})

router.get('/pdf-generator', (req, res) => {


    (async () => {
        try {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()

            const content = await compile('professores', dataProf)

            await page.setContent(content)
            await page.emulateMedia('screen')
            await page.pdf({ path: 'teste.pdf', format: 'A4', printBackground: true })

            console.log('done')
            await browser.close()
            process.exit()
        }
        catch (e) {
            console.log('Erro' + e)
        }
    })

    /*
    (async()=>{
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto('/pompeius/professor/edit')
        await page.pdf({path: 'teste.pdf', format: "A4"})
        await browser.close()
    })();

    */

})

router.get('/fim-de-sala', (req, res) => {
    res.render('pompeius/fimdesala')
})

router.get('/about', eProf, (req, res) => {
    res.render('professor/about')
})

router.get('/alter-password', eProf, (req, res) => {
    res.render('professor/passwordchange')
})

router.post('/alter-password/process', eProf, (req, res) => {
    var erros = []

    if (!req.body.passbefore || typeof req.body.passbefore == undefined || req.body.passbefore == null) {
        erros.push({ texto: "Senha Antiga: campo obrigatório" })
    }
    if (!req.body.newpass || typeof req.body.newpass == undefined || req.body.newpass == null) {
        erros.push({ texto: "Nova Senha: campo obrigatório" })
    }
    if (req.body.newpass.length < 6) {
        erros.push({ texto: "Nova Senha deve ter no mínimo 6 caracteres" })
    }
    if (req.body.newpass != req.body.newpassconfirm) {
        erros.push({ texto: "Nova Senha e Confirmar Nova Senha não correspondem" })
    }
    if (erros.length > 0) {
        res.render('professor/passwordchange', { erros })
    }
    else {

        Professor.findOne({ _id: req.body.idpass }).then((professor) => {
            if (!professor) {
                req.flash('error_msg', 'Conta não encontrada!')
                res.redirect('/pompeius/professor/alter-password')
                console.log('Achou prof')
            }

            bcrypt.compare(req.body.passbefore, professor.password, (erro, batem) => {
                if (batem) {
                    console.log('Batem')

                    professor.password = req.body.newpass

                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(professor.password, salt, (erro, hash) => {
                            if (erro) {
                                req.flash('error_msg', 'Erro ao salvar nova senha! ERRO: 347-P')
                                res.redirect('/pompeius/inicio')
                                console.log('erro 352 hash')
                            }
                            else {
                                professor.password = hash

                                professor.save().then(() => {
                                    req.flash('success_msg', "Senha alterada com sucesso!")
                                    res.redirect('/pompeius/inicio')
                                    console.log('senha alterada com sucesso!')
                                }).catch((err) => {
                                    req.flash('error_msg', 'Erro ao salvar nova senha')
                                    res.redirect('/pompeius/professor/alter-password')
                                    console.log('erro ao alterar')
                                })
                            }
                        })
                    })

                    // return done(null, professor)
                } else {
                    req.flash('error_msg', "Senha Antiga: inválida")
                    res.redirect('/pompeius/professor/alter-password')
                    console.log('senha antiga incorreta')
                }
            })
        })

    }

})

router.get('/remove-account', eProf, (req, res) => {
    res.render('professor/removeaccount')
})

router.get('/remove-account/:id', eProf, (req, res) => {
    Professor.findOne({ _id: req.params.id }).then((professor) => {
        if (professor) {
            professor.remove().then(() => {
                req.flash('success_msg', "Pronto! Sua conta foi excluida.")
                res.redirect('/pompeius')
            }).catch((err) => {
                req.flash('error_msg', "Erro ao excluir conta")
                res.redirect('/pompeius/inicio')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', "Erro interno")
        res.redirect('/pompeius/inicio')
    })
})

router.get('/professores', eProf, (req, res) => {
    Professor.find().then((professores) => {
        res.render('professor/professores', { professores: professores })
    }).catch((err) => {
        console.log("Erro ao listar professores: " + err)
    })
})

router.get('/relatorios', (req, res) => {
    res.render('professor/relatoriosDownload')
})

module.exports = router