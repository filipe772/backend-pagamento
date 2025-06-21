require('dotenv').config();

const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configura o token do Mercado Pago usando a variável do .env
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});


// Endpoint para criar pagamento via Pix
app.post('/criar-pagamento', async (req, res) => {
  try {
    const payment_data = {
      transaction_amount: 4.99,
      description: 'Pagamento do contrato de transporte',
      payment_method_id: 'pix',
      payer: {
        email: 'pagador@email.com', // Pode ajustar aqui se quiser receber do frontend
        first_name: 'Fulano',
        last_name: 'da Silva',
        identification: {
          type: 'CPF',
          number: '12345678909',
        },
      },
    };

    const payment = await mercadopago.payment.create(payment_data);
    const qr_code = payment.body.point_of_interaction.transaction_data.qr_code;

    return res.json({
      codigo_pix: qr_code,
      payment_id: payment.body.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// Exemplo de rota no backend Express
app.get('/verificar-pagamento/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pagamento = await mercadopago.payment.get(id);
    const status = pagamento.body.status; // approved, pending, rejected, etc.
    res.json({ status });
  } catch (error) {
    console.error('Erro ao consultar status do pagamento:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao consultar pagamento' });
  }
});
// Define a porta e inicia o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});









