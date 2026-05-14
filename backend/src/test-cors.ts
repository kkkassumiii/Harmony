import express from 'express';

const app = express();

app.use((req, res, next) => {
  console.log('TEST: CORS middleware executing');
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  next();
});

app.get('/test', (req, res) => {
  res.json({ test: true });
});

app.listen(9999, () => {
  console.log('Test server on 9999');
});
