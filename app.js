//Carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyparser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const professor = require("./routes/professor")
const pompeius = require("./routes/pompeius")
const path = require("path")
const mongoose = require("mongoose")
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
require("./config/auth")(passport)
require("./models/Postagem")
const Postagem = mongoose.model("postagens")

//Config
//Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    //res.locals.idRoom = Math.floor(Math.random() * 10000)
    next()
})
//body-parser
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())
//handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars');
//mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://mongodb.pompeius.kinghost.net/pompeius01").then(() => {
    console.log("Conectado ao banco com sucesso!")
}).catch((err) => {
    console.log("Erro ao se conectar ao banco: " + err)
})

//Public
app.use(express.static(path.join(__dirname, "public")))



//routes
app.get('/', (req, res) => {
    Postagem.find().populate("categorias").sort({ data: "desc" }).then((postagens) => {
        res.render('index', { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', "Erro interno")
        res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {

        }
        else {

        }
    })
})

app.get('/404', (req, res) => {
    res.send('Erro: ' + err)
})

app.use('/pompeius', pompeius)
app.use('/professor', professor)
app.use('/admin', admin)

//outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})