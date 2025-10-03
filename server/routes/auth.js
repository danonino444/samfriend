const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    // Crear nuevo usuario
    const user = new User({ username, password });
    await user.save();
    
    // Iniciar sesión automáticamente después del registro
    req.session.userId = user._id;
    req.session.username = user.username;
    
    res.json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }
    
    // Crear sesión
    req.session.userId = user._id;
    req.session.username = user.username;
    
    res.json({ 
      success: true, 
      message: 'Login exitoso',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada' });
  });
});

// Verificar sesión
router.get('/check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ 
      loggedIn: true, 
      user: { 
        id: req.session.userId, 
        username: req.session.username 
      } 
    });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;