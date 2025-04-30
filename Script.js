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

 // rota default
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/bem vindo.html")
});

// rota para o menu
app.get("/menu", function (req, res) {
    res.sendFile(__dirname + "/Menu.html")
});

//rota para a lista de moradores
app.get('/listM', function (req, res) {
    const ListM = "SELECT * FROM morador";

    connection.query(ListM, function (err, rows) {
        if (!err) {
            console.log("Consulta realizada com sucesso!");
            res.send(`
                <html>
                <head>
                    <title>Lista de Moradores</title>
                       <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f3eee7;
                        margin: 0;
                        padding: 40px;
                    }

                    h1 {
                        text-align: center;
                        font-size: 28px;
                    }

                    h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                    }

                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                    }

                    label {
                        font-weight: bold;
                    }

                    input[type="text"] {
                        padding: 5px;
                        width: 200px;
                        margin-right: 10px;
                    }

                    .buttons {
                        display: flex;
                        gap: 10px;
                        margin-top: 10px;
                        margin-bottom: 20px;
                    }

                    button {
                        padding: 6px 12px;
                        background-color: #eee;
                        border: 1px solid #aaa;
                        border-radius: 5px;
                        cursor: pointer;
                    }

                    button:hover {
                        background-color: #ddd;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        background-color: white;
                    }

                    th {
                        background-color: #ccc;
                        padding: 10px;
                        text-align: left;
                    }

                    td {
                        border: 1px solid #333;
                        padding: 8px;
                    }

                    td:last-child {
                        text-align: center;
                    }

                    .acoes a {
                        margin: 0 5px;
                        color: #000;
                        text-decoration: underline;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Condomínio</h1>
                    <h2>Pesquisar Morador</h2>
                    
                    <div>
                        <label for="pesquisa">Pesquisa:</label>
                        <input type="text" id="pesquisa" name="pesquisa">
                    </div>

                    <div class="buttons">
                        <button onclick="location.href='/regisM'">Cadastrar Morador</button>
                        <button onclick="location.href='/menu'">Voltar para o menu</button>
                    </div>
                        <table>
                            <tr>
                                <th>CPF</th>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>IDapartamento</th>
                                <th>Ações</th>
                            </tr>
                            ${rows.map(row => `
                                <tr>
                                    <td>${row.cpf}</td>
                                    <td>${row.nome}</td>
                                    <td>${row.telefone}</td>
                                    <td>${row.id_apartamento}</td>
                                    <td>
                                        <a href="/excluir/${row.id_morador}">Excluir</a> 
                                        <a href="/editar/${row.id_morador}">Editar</a>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                        <div class="voltar">
                            <a href="/menu">Voltar</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        } else {
            console.log("Erro na lista de moradores", err);
            res.send("Erro");
        }
    });
});

app.get('/excluir/:id_morador', function (req, res) {
    const id_morador = req.params.id_morador;

    connection.query('DELETE FROM morador WHERE id_morador = ?', [id_morador], function (err, result) {
        if (err) {
            console.error('Erro ao excluir esta Indivíduo: ', err);
            res.status(500).send('Erro interno ao excluir este morador.');
            return;
        }

        console.log("Morador excluido com sucesso!");
        res.redirect('/listM');
    })
})

app.get('/editar/:id_morador', function (req, res) {
    const id_morador = req.params.id_morador; // Obtém o ID do produto a ser editado da URL
    const select = "SELECT * FROM morador WHERE id_morador = ?";

    connection.query(select, [id_morador], function (err, rows) {
        if (!err) {
            console.log("Morador encontrado com sucesso!");
            res.send(`
                <html>
                    <head>
                        <title> Editar produto </title>
                        </head>
                    <body>
                        <h1>Editar Morador</h1>
                        <form action="/editar/${id_morador}" method="POST">
                            <label for="cpf">CPF:</label><br>
                            <input type="text" name="cpf" value="${rows[0].cpf}"><br><br>
                            <label for="nome">Nome:</label><br>
                            <input type="text" name="nome" value="${rows[0].nome}"><br><br>
                            <label for="telefone">Telefone:</label><br>
                            <input type="tel" name="telefone" value="${rows[0].telefone}"><br><br>
                            <label for="id_apartamento">ID do apartamento:</label><br>
                            <input type="number" name="id_apartamento" value="${rows[0].id_apartamento}"><br><br>
                            <input type="submit" value="Salvar">
                        </form>
                    </body>
                </html>`);
        } else {
            console.log("Erro ao buscar o indivíduo ", err);
            res.send("Erro")
        }
    });

});

app.post('/editar/:id_morador', function (req, res) {
    const id_morador = req.params.id_morador
    const cpf = req.body.cpf;
    const nome = req.body.nome;
    const telefone = req.body.telefone;
    const id_apartamento = req.body.id_apartamento;


    const update = "UPDATE morador SET cpf = ?, nome = ?, telefone = ?, id_apartamento = ? WHERE id_morador = ?";
connection.query(update, [cpf, nome, telefone, id_apartamento, id_morador], function (err, result) {
    if (!err) {
        console.log("morador editado com sucesso!");
        res.redirect('/listM');
    } else {
        console.log("Erro ao editar o produto ", err);
        res.send("Erro")
    }
});
});

//rota para o registrar o morador
app.get("/regisM", function (req, res) {
    res.sendFile(__dirname + "/loginMorador.html")
});

app.post("/registroMorador", function (req, res) {
    const nome = req.body.nome;
    const cpf = req.body.cpf;
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