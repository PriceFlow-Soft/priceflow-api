// Importa os frameworks necessários.
const express = require('express');
const mysql = require('mysql2/promise'); // Usamos a versão com 'promise' para código mais limpo.

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração do pool de conexões com o banco de dados.
// Um 'pool' gerencia múltiplas conexões de forma eficiente.
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // Esta é a forma segura e recomendada de conectar ao Cloud SQL a partir do Cloud Run.
  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
};

const pool = mysql.createPool(dbConfig);

// ========= ENDPOINTS DA API =========

// Endpoint 1: Raiz (Status da API)
app.get('/', (req, res) => {
  res.send('API do PriceFlow está online. Status: Operacional.');
});

// Endpoint 2: Diagnóstico de Conexão com o Banco de Dados
app.get('/test-db', async (req, res) => {
  try {
    // Pega uma conexão do pool.
    const connection = await pool.getConnection();
    
    // Executa uma consulta simples para testar a conexão.
    const [rows] = await connection.query('SELECT NOW() as currentTime;');
    
    // Libera a conexão de volta para o pool.
    connection.release();
    
    // Responde com sucesso.
    res.status(200).json({
      status: 'SUCESSO',
      message: 'Conexão com o banco de dados Cloud SQL estabelecida com sucesso.',
      databaseTime: rows[0].currentTime
    });
  } catch (error) {
    // Em caso de erro, loga o erro no servidor e responde com uma mensagem de falha.
    console.error('Erro ao conectar com o banco de dados:', error);
    res.status(500).json({
      status: 'FALHA',
      message: 'Não foi possível conectar ao banco de dados Cloud SQL.',
      error: error.message
    });
  }
});


// Inicia o servidor.
app.listen(PORT, () => {
  console.log(`Servidor PriceFlow API escutando na porta ${PORT}`);
});