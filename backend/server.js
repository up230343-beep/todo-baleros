const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bearingRoutes = require('./routes/bearingRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rodamientos_db';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conexión a MongoDB establecida exitosamente.'))
  .catch(err => console.error(' Error al conectar a MongoDB:', err));

app.use('/api/baleros', bearingRoutes);

// Servir el frontend compilado en producción
const frontendDist = path.join(__dirname, '../bearings-polished-main/dist');
app.use(express.static(frontendDist));

// Catch-all: devolver index.html para React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Servidor de DataStrike ejecutándose en el puerto ` + PORT);
});
