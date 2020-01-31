module.exports = {
    eAluno: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAluno == 1){
            return next();
        }
        req.flash('error_msg', "Você deve entrar em uma sala! ")
        res.redirect('/pompeius')
    }
}