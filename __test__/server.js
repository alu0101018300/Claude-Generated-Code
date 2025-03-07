const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const noteRoutes = require('../routes/noteRoutes');
const { errorHandler } = require('../middleware/errorHandler');

// Configurar entorno de pruebas
dotenv.config({ path: '.env.test' });

// Crear aplicación Express para pruebas
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/notas', noteRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Función para conectar a la base de datos de pruebas
const connectTestDB = async () => {
  try {
    // Usar una URI de MongoDB en memoria o de pruebas
    const testMongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test_notes_db';
    
    await mongoose.connect(testMongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a base de datos de pruebas');
  } catch (error) {
    console.error('Error de conexión a base de datos de pruebas:', error);
    process.exit(1);
  }
};

// Conectar a la base de datos antes de las pruebas
before(async () => {
  await connectTestDB();
});

// Desconectar después de las pruebas
after(async () => {
  await mongoose.connection.close();
});

module.exports = app;