const Stripe = require('stripe');
const stripe = Stripe('SUA_CHAVE_SECRETA_DO_STRIPE'); // Substitua com sua chave secreta

const criarPagamentoIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // Exemplo: 10.00 USD
      currency: 'usd',
    });
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (erro) {
    res.status(500).send({ erro: 'Erro ao criar pagamento' });
  }
};

module.exports = { criarPagamentoIntent };
