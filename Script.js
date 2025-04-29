const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gestaocondominio',
    port: 3306
});

connection.connect(function (err) {
    if (err) {
        console.error('Erro ', err);
        return
    }
    console.log("Conexão ok")
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/bem vindo.html")
});

app.get("/menu", function (req, res) {
    res.sendFile(__dirname + "/Menu.html")
});

app.get("/listM", function (req, res) {
    res.sendFile(__dirname + "/ListaMorador.html")
});

app.get("/regisM", function (req, res) {
    res.sendFile(__dirname + "/ListaMorador.html")
});

app.get("/registroMorador", function (req, res) {
    const nome = req.body.nome;
    const cpf = req.body.email;
    const telefone = req.body.telefone;
    const id_apartamento = req.body.id_apartamento;


    const values = [nome, cpf, telefone, id_apartamento];
    const insert = "INSERT INTO morador (nome, cpf, telefone, id_apartamento) VALUES (?,?,?,?)"

    connection.query(insert, values, function (err, result) {
        if (!err) {
            console.log("Dados inseridos com sucesso!");
            res.redirect('/listM');
        } else {
            console.log("Não foi possível inserir os dados ", err);
            res.send("Erro!")
        }
    })

});

app.get("/listA", function (req, res) {
    res.sendFile(__dirname + "/ListaApartamento.html")
});

app.get("/listB", function (req, res) {
    res.sendFile(__dirname + "/ListaBloco.html")
});

app.get("/listP", function (req, res) {
    res.sendFile(__dirname + "/ListaPagamento.html")
});




app.listen(8083, function () {
    console.log("Servidor rodando na url http://localhost:8083")
})