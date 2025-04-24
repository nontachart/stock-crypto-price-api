const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const yahooFinance = require('yahoo-finance2').default;
const CoinGecko = require('coingecko-api');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // cache timeout = 60 seconds
const PORT = 3000;
const CoinGeckoClient = new CoinGecko();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock and Crypto Price API',
      version: '1.0.0',
      description: 'API for fetching stock and cryptocurrency prices',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /crypto:
 *   get:
 *     summary: Get cryptocurrency price
 *     description: Retrieve the current price of a cryptocurrency
 *     parameters:
 *       - in: query
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cryptocurrency ID (e.g., bitcoin, ethereum)
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Missing coinId parameter
 *       404:
 *         description: Coin not found
 *       500:
 *         description: Server error
 */
app.get('/crypto', async (req, res) => {
    const coinId = req.query.coinId?.toLowerCase();
    
    if (!coinId) {
        return res.status(400).json({ error: 'Coin ID is required' });
    }

    const cacheKey = `crypto-${coinId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json({ source: 'cache', ...cachedData });
    }

    try {
        const response = await CoinGeckoClient.simple.price({
            ids: [coinId],
            vs_currencies: ['usd']
        });
        if (!response.data[coinId]) {
            return res.status(404).json({ error: 'Coin not found' });
        }

        const priceData = {
            coinId,
            price: new Intl.NumberFormat().format(response.data[coinId].usd),
            currency: 'USD',
            time: new Date().toISOString()
        };

        cache.set(cacheKey, priceData);
        res.json({ source: 'api', ...priceData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch data', detail: err.message });
    }
    
});

/**
 * @swagger
 * /stocks:
 *   get:
 *     summary: Get stock price
 *     description: Retrieve the current price of a stock
 *     parameters:
 *       - in: query
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock ticker symbol (e.g., AAPL, GOOGL)
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Missing ticker parameter
 *       500:
 *         description: Server error
 */
app.get('/stocks', async (req, res) => {
    const ticker = req.query.ticker?.toUpperCase();

    if (!ticker) {
        return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    const cacheKey = `stock-${ticker}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json({ source: 'cache', ...cachedData });
    }

    try {
        const quote = await yahooFinance.quote(ticker);
        const priceData = {
            ticker,
            name: quote.shortName,
            price: new Intl.NumberFormat().format(quote.regularMarketPrice),
            currency: quote.currency,
            time: new Date().toISOString()
        };

        cache.set(cacheKey, priceData);
        res.json({ source: 'api', ...priceData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch data', detail: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Documentation on http://localhost:${PORT}/api-docs`);
});
