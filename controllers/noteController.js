const asyncHandler = require('express-async-handler');
const Note = require('../models/noteModel');

// @desc    Crear una nueva nota
// @route   POST /api/notas
// @access  Public
const createNote = asyncHandler(async (req, res) => {
  const { titulo, contenido } = req.body;

  if (!titulo || !contenido) {
    res.status(400);
    throw new Error('Por favor proporcione título y contenido');
  }

  const note = await Note.create({
    titulo,
    contenido,
  });

  res.status(201).json(note);
});

// @desc    Obtener todas las notas
// @route   GET /api/notas
// @access  Public
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find();
  res.status(200).json(notes);
});

// @desc    Obtener una nota por ID
// @route   GET /api/notas/:id
// @access  Public
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note) {
    res.status(404);
    throw new Error('Nota no encontrada');
  }
  
  res.status(200).json(note);
});

// @desc    Actualizar una nota
// @route   PUT /api/notas/:id
// @access  Public
const updateNote = asyncHandler(async (req, res) => {
  const { titulo, contenido } = req.body;
  
  // Verificar que al menos un campo esté presente
  if (!titulo && !contenido) {
    res.status(400);
    throw new Error('Por favor proporcione título o contenido para actualizar');
  }
  
  const note = await Note.findById(req.params.id);
  
  if (!note) {
    res.status(404);
    throw new Error('Nota no encontrada');
  }
  
  const updatedNote = await Note.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedNote);
});

// @desc    Eliminar una nota
// @route   DELETE /api/notas/:id
// @access  Public
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note) {
    res.status(404);
    throw new Error('Nota no encontrada');
  }
  
  await note.deleteOne();
  
  res.status(200).json({ id: req.params.id, message: 'Nota eliminada' });
});

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};