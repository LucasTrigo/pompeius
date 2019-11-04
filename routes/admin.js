const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
require("../models/Postagem")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send("Página de posts")
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias)=>{
    res.render("admin/categorias", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao listar categorias")
        res.redirect('/admin')
    })
})

router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategoria")
})

router.post("/categorias/nova", (req, res)=>{

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(erros.length>0){
        res.render("admin/addcategoria", {erros: erros})
    }
    else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categorias criado com sucesso! ")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao criar a categoria! Tente novamente")
            res.redirect("/admin")
        })

    }
    
})

router.get("/categorias/edit/:id", (req, res)=> {
    Categoria.findOne({_id: req.params.id}).then((categoria)=>{
        res.render ("admin/editcategorias", {categoria: categoria})
    }).catch((err)=>{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", (req, res)=> {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria)=>{
            
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(()=>{
                req.flash("success_msg", "Categoria criado com sucesso! ")
                res.redirect("/admin/categorias")

            }).catch((err)=>{
                req.flash("error_msg", "Erro interno ao salvar categoria")
                res.redirect("/admin/categorias")
            })

        }).catch((err)=>{
            req.flash("error_msg", "Erro ao editar categoria!")
            res.redirect("/admin/categorias")
        })

    }
})

router.post("/categorias/deletar", (req, res)=> {
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso! ")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao deletar categoria!")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res)=> {
    Postagem.find().populate("categoria").sort({data: 'desc'}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao carregar postagens")
        res.redirect('/admin')
    })
})

router.get("/postagens/add", (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao carregar formulário")
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', (req, res)=>{
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida!"})
    }
    
    if(erros.length>0){
        res.render('admin/addpostagem', {erros: erros})
    }else{

        const novaPostagem = {
            titulo: req.body.titulo, 
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao salvar postagem!")
            res.redirect("/admin/postagens")
        })

    }
})

router.get('/postagens/edit/:id', (req, res)=>{

    Postagem.findOne({_id: req.params.id}).then((postagem)=>{
        Categoria.find().then((categorias)=>{
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao listar categorias")
            res.redirect('/admin/postagens')
        })
    }).catch((err)=>{
        req.flash('error_msg', "erro! post não existe.")
        res.redirect('/admin/postagens')
    })

})

router.post('/postagens/edit', (req, res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg', "Alterações Salvas!")
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg', "Erro interno!")
            res.redirect('/admin/postagens')
        })
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao salvar alterações!")
        res.redirect('/admin/postagens')
    })
})


//outra maneira de deletar a postagem

/*
router.get('/postagens/deletar/:id', (req, res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash('success_msg', "Postagem Deletada com sucesso!")
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao deletar postagem!")
        res.redirect('/admin/postagens')
    })
})*/


router.post('/postagens/delete', (req, res)=>{
    Postagem.remove({_id: req.body.id}).then(()=>{
        req.flash('success_msg', "Postagem deletada com sucesso")
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao excluir postagem")
        res.redirect('/admin/postagens')
    })
})


module.exports = router