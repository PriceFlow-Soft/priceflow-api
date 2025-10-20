// Importa o framework Express para criar o servidor.
const express = require('express');
const app = express();

// Define a porta em que o servidor irá escutar. 
// O Cloud Run fornecerá essa porta através da variável de ambiente PORT.
const PORT = process.env.PORT || 8080;

// Cria um ponto de acesso (endpoint) na raiz ('/') do nosso serviço.
// Quando alguém acessar a URL principal, esta função será executada.
app.get('/', (req, res) => {
  res.send('API do PriceFlow está online. Status: Operacional.');
});

// Inicia o servidor e o faz escutar por requisições na porta definida.
app.listen(PORT, () => {
  console.log(`Servidor PriceFlow API escutando na porta ${PORT}`);
});