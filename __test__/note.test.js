// Dependencias necesarias
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Asume que exportas el app de Express
const Note = require('../models/noteModel');

let mongoServer;

// Configuración antes de todas las pruebas
beforeAll(async () => {
  // Usar MongoDB en memoria para pruebas
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
});

// Limpiar base de datos antes de cada prueba
beforeEach(async () => {
  await Note.deleteMany({});
});

// Cerrar conexiones después de todas las pruebas
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('API de Gestión de Notas', () => {
  // Caso de Uso 1: Crear Nota
  describe('POST /api/notas', () => {
    it('Debe crear una nueva nota correctamente', async () => {
      const notaData = {
        titulo: 'Nota de Prueba',
        contenido: 'Contenido de prueba para la nota'
      };

      const respuesta = await request(app)
        .post('/api/notas')
        .send(notaData)
        .expect(201);

      // Verificaciones
      expect(respuesta.body.titulo).toBe(notaData.titulo);
      expect(respuesta.body.contenido).toBe(notaData.contenido);
      expect(respuesta.body._id).toBeDefined();
    });

    it('Debe fallar si falta título o contenido', async () => {
      const notaIncompleta = {
        titulo: 'Nota Incompleta'
      };

      await request(app)
        .post('/api/notas')
        .send(notaIncompleta)
        .expect(400);
    });
  });

  // Caso de Uso 2: Obtener Lista de Notas
  describe('GET /api/notas', () => {
    it('Debe obtener todas las notas', async () => {
      // Crear algunas notas de prueba
      const notasPrueba = [
        { titulo: 'Nota 1', contenido: 'Contenido 1' },
        { titulo: 'Nota 2', contenido: 'Contenido 2' }
      ];
      await Note.create(notasPrueba);

      const respuesta = await request(app)
        .get('/api/notas')
        .expect(200);

      expect(respuesta.body.length).toBe(2);
      expect(respuesta.body[0].titulo).toBe('Nota 1');
    });

    it('Debe devolver un array vacío si no hay notas', async () => {
      const respuesta = await request(app)
        .get('/api/notas')
        .expect(200);

      expect(respuesta.body.length).toBe(0);
    });
  });

  // Caso de Uso 3: Obtener Nota por ID
  describe('GET /api/notas/:id', () => {
    it('Debe obtener una nota específica por ID', async () => {
      const nota = await Note.create({
        titulo: 'Nota a Buscar',
        contenido: 'Contenido de la nota a buscar'
      });

      const respuesta = await request(app)
        .get(`/api/notas/${nota._id}`)
        .expect(200);

      expect(respuesta.body.titulo).toBe(nota.titulo);
      expect(respuesta.body._id).toBe(nota._id.toString());
    });

    it('Debe devolver 404 si la nota no existe', async () => {
      const idNoExistente = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/notas/${idNoExistente}`)
        .expect(404);
    });
  });

  // Caso de Uso 4: Editar Nota
  describe('PUT /api/notas/:id', () => {
    it('Debe actualizar una nota existente', async () => {
      const nota = await Note.create({
        titulo: 'Nota Original',
        contenido: 'Contenido original'
      });

      const datosActualizados = {
        titulo: 'Nota Actualizada',
        contenido: 'Contenido actualizado'
      };

      const respuesta = await request(app)
        .put(`/api/notas/${nota._id}`)
        .send(datosActualizados)
        .expect(200);

      expect(respuesta.body.titulo).toBe(datosActualizados.titulo);
      expect(respuesta.body.contenido).toBe(datosActualizados.contenido);
    });

    it('Debe fallar si se intenta actualizar con datos vacíos', async () => {
      const nota = await Note.create({
        titulo: 'Nota Original',
        contenido: 'Contenido original'
      });

      await request(app)
        .put(`/api/notas/${nota._id}`)
        .send({})
        .expect(400);
    });
  });

  // Caso de Uso 5: Eliminar Nota
  describe('DELETE /api/notas/:id', () => {
    it('Debe eliminar una nota existente', async () => {
      const nota = await Note.create({
        titulo: 'Nota a Eliminar',
        contenido: 'Contenido a eliminar'
      });

      const respuesta = await request(app)
        .delete(`/api/notas/${nota._id}`)
        .expect(200);

      expect(respuesta.body.id).toBe(nota._id.toString());
      
      // Verificar que la nota realmente fue eliminada
      const notaEliminada = await Note.findById(nota._id);
      expect(notaEliminada).toBeNull();
    });

    it('Debe fallar al intentar eliminar una nota no existente', async () => {
      const idNoExistente = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/api/notas/${idNoExistente}`)
        .expect(404);
    });
  });
});
