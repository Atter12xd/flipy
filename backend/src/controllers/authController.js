const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const BCRYPT_ROUNDS = 10;

/**
 * Registro de Motorizado
 * POST /api/auth/register/motorizado
 */
const registerMotorizado = async (req, res) => {
  try {
    const { email, password, phone, licencia, vehiculo } = req.body;

    // Validar campos requeridos
    if (!email || !password || !licencia || !vehiculo) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos: email, password, licencia, vehiculo'
      });
    }

    // Validar longitud de password
    if (password.length < 8) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    // Verificar que la licencia no exista
    const existingLicencia = await prisma.motorizado.findUnique({
      where: { licencia }
    });

    if (existingLicencia) {
      return res.status(400).json({
        message: 'La licencia ya está registrada'
      });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Calcular fecha de trial (7 días)
    const trialHasta = new Date();
    trialHasta.setDate(trialHasta.getDate() + 7);

    // Crear User y Motorizado en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone,
          role: 'MOTORIZADO'
        }
      });

      // Crear perfil de motorizado
      const motorizado = await tx.motorizado.create({
        data: {
          userId: user.id,
          licencia,
          vehiculo,
          suscripcionActiva: false,
          trialHasta
        }
      });

      return { user, motorizado };
    });

    // Generar JWT token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role
    });

    // Retornar respuesta
    res.status(201).json({
      message: 'Motorizado registrado exitosamente',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        phone: result.user.phone,
        motorizado: {
          id: result.motorizado.id,
          licencia: result.motorizado.licencia,
          vehiculo: result.motorizado.vehiculo,
          trialHasta: result.motorizado.trialHasta
        }
      }
    });

  } catch (error) {
    console.error('Error en registerMotorizado:', error);
    res.status(500).json({
      message: 'Error al registrar motorizado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Registro de Tienda
 * POST /api/auth/register/tienda
 */
const registerTienda = async (req, res) => {
  try {
    const { email, password, phone, nombre, direccion } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !direccion) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos: email, password, nombre, direccion'
      });
    }

    // Validar longitud de password
    if (password.length < 8) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Crear User y Tienda en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          phone,
          role: 'TIENDA'
        }
      });

      // Crear perfil de tienda
      const tienda = await tx.tienda.create({
        data: {
          userId: user.id,
          nombre,
          direccion,
          billetera: 0.0,
          comision: 0.05 // 5% por defecto
        }
      });

      return { user, tienda };
    });

    // Generar JWT token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role
    });

    // Retornar respuesta
    res.status(201).json({
      message: 'Tienda registrada exitosamente',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        phone: result.user.phone,
        tienda: {
          id: result.tienda.id,
          nombre: result.tienda.nombre,
          direccion: result.tienda.direccion,
          billetera: result.tienda.billetera,
          comision: result.tienda.comision
        }
      }
    });

  } catch (error) {
    console.error('Error en registerTienda:', error);
    res.status(500).json({
      message: 'Error al registrar tienda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login de usuario
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y password son requeridos'
      });
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        motorizado: true,
        tienda: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Validar password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Generar JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Preparar datos del usuario según su rol
    let userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    if (user.role === 'MOTORIZADO' && user.motorizado) {
      userData.motorizado = {
        id: user.motorizado.id,
        licencia: user.motorizado.licencia,
        vehiculo: user.motorizado.vehiculo,
        suscripcionActiva: user.motorizado.suscripcionActiva,
        trialHasta: user.motorizado.trialHasta
      };
    }

    if (user.role === 'TIENDA' && user.tienda) {
      userData.tienda = {
        id: user.tienda.id,
        nombre: user.tienda.nombre,
        direccion: user.tienda.direccion,
        billetera: user.tienda.billetera,
        comision: user.tienda.comision
      };
    }

    // Retornar respuesta
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerMotorizado,
  registerTienda,
  login
};

