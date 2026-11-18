console.log('Starting simple server...');

try {
  const express = require('express');
  console.log('Express loaded successfully');
  
  const app = express();
  const PORT = 5000;
  
  app.get('/', (req, res) => {
    res.json({ message: 'Hostel Management API is running!' });
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
} catch (error) {
  console.error('Error starting server:', error);
}
