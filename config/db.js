if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb://pompeius02:123456@mongodb.pompeius.kinghost.net/pompeius02"}
}
else{
    module.exports = {mongoURI: "mongodb://localhost/pompeius"}
}