import app from './src/app';

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Identity Server running on http://localhost:${PORT}`);
});
