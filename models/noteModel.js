const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'Por favor ingrese un título'],
      trim: true,
    },
    contenido: {
      type: String,
      required: [true, 'Por favor ingrese contenido'],
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;