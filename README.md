# Stock or Crypto Price API

A RESTful API service that provides real-time stock and cryptocurrency price data with caching capabilities.

## Features

- Get real-time stock prices using Yahoo Finance API
- Get real-time cryptocurrency prices using CoinGecko API
- Built-in caching system (60-second TTL)
- Swagger API documentation
- Error handling and input validation

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run serve:dev
```

The server will start on `http://localhost:3000`

## API Endpoints
## API Documentation

Swagger documentation is available at:
```
http://localhost:3000/api-docs
```

### Get Stock Price
```
GET /stocks?ticker=SYMBOL
```
Example: `http://localhost:3000/stocks?ticker=AAPL`

### Get Cryptocurrency Price
```
GET /crypto?coinId=COIN_ID
```
Example: `http://localhost:3000/crypto?coinId=bitcoin`



## Response Format

### Stock Response
```json
{
    "source": "api",
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "price": "175.34",
    "currency": "USD",
    "time": "2024-04-24T12:00:00.000Z"
}
```

### Crypto Response
```json
{
    "source": "api",
    "coinId": "bitcoin",
    "price": "64,123.45",
    "currency": "USD",
    "time": "2024-04-24T12:00:00.000Z"
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- 400: Bad Request (missing parameters)
- 404: Not Found (coin not found)
- 500: Server Error

## Dependencies

- express: Web framework
- yahoo-finance2: Stock price data
- coingecko-api: Cryptocurrency price data
- node-cache: Caching system
- swagger-jsdoc & swagger-ui-express: API documentation
