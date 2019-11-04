module.exports = {
    eProf: function(req, res, next){
        if(req.isAuthenticated() && req.user.eProf == 1){
            return next();
        }
        req.flash('error_msg', "Você deve efetuar login! ")
        res.redirect('/pompeius')
    }
}