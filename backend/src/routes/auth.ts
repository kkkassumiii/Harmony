import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 *       500:
 *         description: Ошибка сервера
 */
router.post('/register', 
  body('email')
    .isEmail()
    .withMessage('Некорректный формат email')
    .normalizeEmail(),
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Имя пользователя должно содержать 3-50 символов')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Имя пользователя может содержать только буквы, цифры, - и _'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  async (req, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array()[0].msg,
          details: errors.array()
        });
      }

      const { email, username, password } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Имя пользователя';
        return res.status(400).json({ error: `${field} уже используется` });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          profile: {
            create: {},
          },
        },
      });

      const token = generateToken(user.id);

      res.status(201).json({
        message: 'Пользователь успешно создан',
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username 
        },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Ошибка при регистрации. Пожалуйста, попробуйте позже' });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login',
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Имя пользователя обязательно'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
  async (req, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array()[0].msg,
          details: errors.array()
        });
      }

      const { username, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      const token = generateToken(user.id);

      res.json({
        message: 'Успешный вход',
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username 
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка при входе. Пожалуйста, попробуйте позже' });
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о текущем пользователе
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      id: user.id, 
      email: user.email, 
      username: user.username,
      profile: user.profile,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
