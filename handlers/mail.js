const nodemailer = require('nodemailer'); // libreria para enviar emails
const pug = require('pug');
const juice = require('juice'); // Convierte html a html con css en linea para navegadores antiguos
const htmlToText = require('html-to-text'); // Convierte html a texto para navegadores y SO antiguos
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({ // Interfaz para enviar emails
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }

});

const generateHTML = (fileName, options = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/email/${fileName}.pug`, options); // para renderizar la ruta dada en el directorio actual donde este ubicada la app
    const inlined = juice(html);
    return inlined;
}

exports.send = async options => {
    const html = generateHTML(options.filename, options);
    const text = htmlToText.fromString(html); // Convertir el html a texto
    const mailOptions = {
        from: `Danilo Gutiérrez <danilo1905@gutierrez.com>`,
        to: options.user.email,
        subject: options.subject,
        html,
        text
    }
    const sendMail = promisify(transport.sendMail, transport); // debido a que no es una promesa
    return sendMail(mailOptions);
}


