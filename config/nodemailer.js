const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

const transport = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  auth: {
    user: "8f081258eac970fe5a516921eb1c9ed7",
    pass: "0b68bf0771576c04210b3191c329ed22"
  }
});

transport.use('compile', hbs({
  viewEngine: {
  extName: '.hbs',
  partialsDir: '../mail/',
  layoutsDir: '../mail/',
  defaultLayout: undefined,
  helpers: undefined,
  compilerOptions: undefined
},
  viewPath: path.resolve('./mail'),
  extName: '.html'
}))

module.exports = transport