import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all habits
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create habit
router.post('/',
  authMiddleware,
  body('title').trim().notEmpty(),
  body('frequency').isIn(['daily', 'weekly', 'monthly']),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, frequency } = req.body;

      const habit = await prisma.habit.create({
        data: {
          userId: req.userId!,
          title,
          description: description || '',
          frequency,
          active: true,
          streak: 0,
        },
      });

      res.status(201).json(habit);
    } catch (error) {
      console.error('Create habit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get habit by id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update habit
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, frequency, active, streak } = req.body;

    const habit = await prisma.habit.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        title,
        description,
        frequency,
        active,
        streak,
      },
    });

    if (habit.count === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const updated = await prisma.habit.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete habit
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const habit = await prisma.habit.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (habit.count === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
