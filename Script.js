const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gestao_condominios',
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


// rota para o menu
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/Menu.html")
});

//Parte de morador -- rota para a lista de moradores
app.get('/listM', function (req, res) {
    const termo = req.query.pesquisa || "";
    const ListM = termo
        ? "SELECT * FROM morador WHERE nome LIKE ?"
        : "SELECT * FROM morador";
    const params = termo ? [`%${termo}%`] : [];

    connection.query(ListM, params, function (err, rows) {
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
                        width: 90%;
                            background: rgba(255, 255, 255, 0.95);
                            padding: 70px;
                            border-radius: 10px;
                            box-shadow: 0px 0px 10px gray;
                            color: black;
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

                    <form method="GET" action="/listM">
                            <label for="pesquisa">Pesquisa:</label>
                            <input type="text" id="pesquisa" name="pesquisa" placeholder ="Coloque o nome do morador" value="${termo}">
                            <input type="submit" value="Buscar">
                        </form>
                    

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
                                        <a href="/excluir/morador/${row.id_morador}">Excluir</a> 
                                        <a href="/editar/morador/${row.id_morador}">Editar</a>
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

app.get('/excluir/morador/:id_morador', function (req, res) {
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

app.get('/editar/morador/:id_morador', function (req, res) {
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

app.post('/editar/morador/:id_morador', function (req, res) {
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
        const termo = req.query.pesquisa || "";
        const ListA = termo
            ? "SELECT * FROM apartamento WHERE id_bloco LIKE ?"
            : "SELECT * FROM apartamento";
        const params = termo ? [`%${termo}%`] : [];
    
        connection.query(ListA, params, function (err, rows) {
            if (!err) {
                res.send(`
                    <html>
                    <head>
                        <title>Lista de Apartamentos</title>
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
                                width: 90%;
                                background: rgba(255, 255, 255, 0.95);
                                padding: 70px;
                                border-radius: 10px;
                                box-shadow: 0px 0px 10px gray;
                                color: black;
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
                            <h2>Pesquisar Bloco</h2>
                            
                            <form method="GET" action="/listA">
                                <label for="pesquisa">Pesquisa:</label>
                                <input type="text" id="pesquisa" name="pesquisa" placeholder ="Coloque o nome do Apartamento" value="${termo}">
                                <input type="submit" value="Buscar">
                            </form>
    
                            <div class="buttons">
                                <button onclick="location.href='/regisA'">Cadastrar bloco</button>
                                <button onclick="location.href='/menu'">Voltar para o menu</button>
                            </div>
    
                            <table>
                                <tr>
                                    <th>Bloco</th>
                                    <th>Numero do apartamento</th>
                                    <th>Ação</th>
                                </tr>
                                ${rows.map(row => `
                                    <tr>
                                        <td>${row.id_bloco}</td>
                                        <td>${row.numero}</td>
                                        <td>
                                            <a href="/excluir/apartamento/${row.id_apartamento}">Excluir</a> 
                                            <a href="/editar/apartamento/${row.id_apartamento}">Editar</a>
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
                console.log("Erro na lista dos blocos", err);
                res.send("Erro");
            }
        });
    });
    
    
    app.get('/excluir/apartamento/:id_apartamento', function (req, res) {
        const id_apartamento = req.params.id_apartamento;
    
        connection.query('DELETE FROM apartamento WHERE id_apartamento = ?', [id_apartamento], function (err, result) {
            if (err) {
                console.error('Erro ao excluir este bloco: ', err);
                res.status(500).send('Erro interno ao excluir este bloco.');
                return;
            }
    
            console.log("apartamento excluido com sucesso!");
            res.redirect('/listA');
        })
    })
    
    app.get('/editar/apartamento/:id_apartamento', function (req, res) {
        const id_apartamento = req.params.id_apartamento; 
        const select = "SELECT * FROM apartamento WHERE id_apartamento = ?";
    
        connection.query(select, [id_apartamento], function (err, rows) {
            if (!err) {
                console.log("Apartamento encontrado com sucesso!");
                res.send(`
                    <html>
                        <head>
                            <title> Editar apartamento </title>
                            </head>
                        <body>
                            <h1>Editar apartamento</h1>
                            <form action="/editar/apartamento/${id_apartamento}"" method="POST">
                                <label for="numero">descrição:</label><br>
                                <input type="number" name="numero" value="${rows[0].numero}" required><br><br>
                                <label for="id_bloco">id do bloco:</label><br>
                                <input type="number" name="id_bloco" value="${rows[0].id_bloco}" required><br><br>
                                <input type="submit" value="Salvar">
                            </form>
                        </body>
                    </html>`);
            } else {
                console.log("Erro ao buscar o apartamento ", err);
                res.send("Erro")
            }
        });
    
    });
    
    app.post('/editar/apartamento/:id_apartamento', function (req, res) {
        const id_apartamento = req.params.id_apartamento;
        const numero = req.body.numero;
        const id_bloco = req.body.id_bloco;
    
    
        const update = "UPDATE apartamento SET numero = ?, id_bloco =?  WHERE id_apartamento = ?";
    connection.query(update, [numero, id_bloco, id_apartamento], function (err, result) {
        if (!err) {
            console.log("apartamento editado com sucesso!");
            res.redirect('/listA');
        } else {
            console.log("Erro ao editar o apartamento ", err);
            res.send("Erro")
        }
    });
    });

    

app.get("/regisA", function (req, res) {
    res.sendFile(__dirname + "/loginApartamento.html")
});
    
    app.post("/registroApartamento", function (req, res) {
        const numero = req.body.numero;
        const id_bloco  = req.body.id_bloco;
        
    
    
        const values = [numero, id_bloco];
        const insert = "INSERT INTO apartamento (numero, id_bloco) VALUES (?,?)"
    
        connection.query(insert, values, function (err, result) {
            if (!err) {
                console.log("Dados do Apartamento inseridos com sucesso!");
                res.redirect('/listA');
            } else {
                console.log("Não foi possível inserir os dados ", err);
                res.send("Erro!")
            }
        })
    });


app.get("/listB", function (req, res) {
    const termo = req.query.pesquisa || "";
    const ListB = termo
        ? "SELECT * FROM bloco WHERE descricao LIKE ?"
        : "SELECT * FROM bloco";
    const params = termo ? [`%${termo}%`] : [];

    connection.query(ListB, params, function (err, rows) {
        if (!err) {
            res.send(`
                <html>
                <head>
                    <title>Lista de blocos</title>
                    <style>
                        /* (seu estilo continua igual) */
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
                            width: 90%;
                            background: rgba(255, 255, 255, 0.95);
                            padding: 70px;
                            border-radius: 10px;
                            box-shadow: 0px 0px 10px gray;
                            color: black;
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
                        <h2>Pesquisar Bloco</h2>
                        
                        <form method="GET" action="/listB">
                            <label for="pesquisa">Pesquisa:</label>
                            <input type="text" id="pesquisa" name="pesquisa" placeholder ="Coloque o nome do Bloco" value="${termo}">
                            <input type="submit" value="Buscar">
                        </form>

                        <div class="buttons">
                            <button onclick="location.href='/regisB'">Cadastrar bloco</button>
                            <button onclick="location.href='/menu'">Voltar para o menu</button>
                        </div>

                        <table>
                            <tr>
                                <th>Descrição/Nome</th>
                                <th>Quantidade de apartamento</th>
                                <th>Ação</th>
                            </tr>
                            ${rows.map(row => `
                                <tr>
                                    <td>${row.descricao}</td>
                                    <td>${row.qtd_apartamentos}</td>
                                    <td>
                                        <a href="/excluir/bloco/${row.id_bloco}">Excluir</a> 
                                        <a href="/editar/bloco/${row.id_bloco}">Editar</a>
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
            console.log("Erro na lista dos blocos", err);
            res.send("Erro");
        }
    });
});


app.get('/excluir/bloco/:id_bloco', function (req, res) {
    const id_bloco = req.params.id_bloco;

    connection.query('DELETE FROM bloco WHERE id_bloco = ?', [id_bloco], function (err, result) {
        if (err) {
            console.error('Erro ao excluir este bloco: ', err);
            res.status(500).send('Erro interno ao excluir este bloco.');
            return;
        }

        console.log("Bloco excluido com sucesso!");
        res.redirect('/listB');
    })
})

app.get('/editar/bloco/:id_bloco', function (req, res) {
    const id_bloco = req.params.id_bloco; 
    const select = "SELECT * FROM bloco WHERE id_bloco = ?";

    connection.query(select, [id_bloco], function (err, rows) {
        if (!err) {
            console.log("Bloco encontrado com sucesso!");
            res.send(`
                <html>
                    <head>
                        <title> Editar Bloco </title>
                        </head>
                    <body>
                        <h1>Editar bloco</h1>
                        <form action="/editar/bloco/${id_bloco}"" method="POST">
                            <label for="descricao">descrição:</label><br>
                            <input type="text" name="descricao" value="${rows[0].descricao}" required><br><br>
                            <label for="qtd_apartamentos">Quantidade de apartamentos:</label><br>
                            <input type="number" name="qtd_apartamentos" value="${rows[0].qtd_apartamentos}" required><br><br>
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

app.post('/editar/bloco/:id_bloco', function (req, res) {
    const id_bloco = req.params.id_bloco;
    const descricao = req.body.descricao;
    const qtd_apartamentos = req.body.qtd_apartamentos;


    const update = "UPDATE bloco SET descricao = ?, qtd_apartamentos =?  WHERE id_bloco = ?";
connection.query(update, [descricao, qtd_apartamentos, id_bloco], function (err, result) {
    if (!err) {
        console.log("bloco editado com sucesso!");
        res.redirect('/listB');
    } else {
        console.log("Erro ao editar o bloco ", err);
        res.send("Erro")
    }
});
});


app.get("/regisB", function (req, res) {
    res.sendFile(__dirname + "/loginBloco.html")
});

app.post("/registroBloco", function (req, res) {
    const descricao = req.body.descricao;
    const qtd_apartamentos = req.body.qtd_apartamentos;
    


    const values = [descricao, qtd_apartamentos];
    const insert = "INSERT INTO bloco (descricao, qtd_apartamentos) VALUES (?,?)"

    connection.query(insert, values, function (err, result) {
        if (!err) {
            console.log("Dados do bloco inseridos com sucesso!");
            res.redirect('/listB');
        } else {
            console.log("Não foi possível inserir os dados ", err);
            res.send("Erro!")
        }
    })
});



app.listen(8083, function () {
    console.log("Servidor rodando na url http://localhost:8083")
})