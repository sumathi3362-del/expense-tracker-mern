# Expense Tracker (MERN)

Beginner-friendly MERN expense tracker with MongoDB persistence and transaction CRUD.

## Requirements
- Node.js and npm
- MongoDB running locally, or a MongoDB connection URI

## 1. Configure backend
Open a terminal in `server` and run:
```bash
npm install
```
Copy `.env.example` to `.env` and adjust `MONGO_URI` if needed.
Start backend:
```bash
npm start
```
Backend runs at http://localhost:5000.

## 2. Start frontend
Open another terminal in `client` and run:
```bash
npm install
npm start
```
Frontend runs at http://localhost:3000.

## Features
- Add income or expense transactions
- Edit and delete transactions
- Balance, income, and expense totals
- Filter by transaction type
- Persists records in MongoDB

This is a learning project, not financial advice software. It has no authentication; don't expose it publicly with personal financial data.
