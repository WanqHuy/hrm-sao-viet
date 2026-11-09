require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Kết nối CSDL và chạy server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  SAO VIET HRM SERVER IS RUNNING ON PORT: ${PORT}`);
    console.log(`  Endpoint: http://localhost:${PORT}/api/v1`);
    console.log(`=======================================================`);
  });
});