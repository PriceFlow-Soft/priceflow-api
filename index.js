// Importa os frameworks necessários.
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração do pool de conexões com o banco de dados.
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
};

const pool = mysql.createPool(dbConfig);

// ========= MIDDLEWARE =========
// Permite que a API entenda requisições com JSON.
app.use(express.json());


// ========= ENDPOINTS DA API =========

// Endpoint 1: Raiz (Status da API)
app.get('/', (req, res) => {
  res.send('API do PriceFlow está online. Status: Operacional.');
});

// Endpoint 2: Diagnóstico de Conexão com o Banco de Dados
app.get('/test-db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT NOW() as currentTime;');
    connection.release();
    res.status(200).json({
      status: 'SUCESSO',
      message: 'Conexão com o banco de dados Cloud SQL estabelecida com sucesso.',
      databaseTime: rows[0].currentTime
    });
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    res.status(500).json({
      status: 'FALHA',
      message: 'Não foi possível conectar ao banco de dados Cloud SQL.',
      error: error.message
    });
  }
});

// Endpoint 3: Análise de Produto (O INÍCIO DO MOTOR DE CÁLCULO)
// Este endpoint recebe um SKU, busca o produto e todas as regras aplicáveis.
app.get('/v1/analyze-product/:sku', async (req, res) => {
  const { sku } = req.params;
  const marketplaceId = 1; // Por enquanto, fixamos em 1 (Mercado Livre)

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Query 1: Buscar o produto e as políticas da sua editora.
    const [productRows] = await connection.query(
      `SELECT p.*, pub.publisher_name, pub.min_net_revenue_percentage 
       FROM products p 
       JOIN publishers pub ON p.publisher_id = pub.id 
       WHERE p.sku = ?`,
      [sku]
    );

    if (productRows.length === 0) {
      connection.release();
      return res.status(404).json({ status: 'FALHA', message: 'Produto não encontrado.' });
    }
    
    const productData = productRows[0];

    // Query 2: Buscar todas as regras ativas para o marketplace.
    const [rulesRows] = await connection.query(
      `SELECT * FROM marketplace_rules WHERE marketplace_id = ? AND is_active = TRUE`,
      [marketplaceId]
    );

    connection.release();

    // Resposta: Retorna o "dossiê" completo para este produto.
    res.status(200).json({
      status: 'SUCESSO',
      analysis_target: {
        product: productData,
        rules: rulesRows
      }
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Erro no endpoint de análise:', error);
    res.status(500).json({
      status: 'FALHA',
      message: 'Erro interno do servidor ao processar a análise.',
      error: error.message
    });
  }
});


// Inicia o servidor.
app.listen(PORT, () => {
  console.log(`Servidor PriceFlow API escutando na porta ${PORT}`);
});