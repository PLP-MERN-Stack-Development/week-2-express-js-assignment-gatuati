# Product API

## Setup
1. Clone repository
2. Run `npm install`
3. Create `.env` file (copy from `.env.example`)
4. Start server: `npm start`

## Endpoints

### Products
- `GET /api/products` - List all (supports ?category=&page=&limit=)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires API key)
- `PUT /api/products/:id` - Update product (requires API key)
- `DELETE /api/products/:id` - Delete product (requires API key)

## Authentication
Include `x-api-key` header with valid API key for protected routes.