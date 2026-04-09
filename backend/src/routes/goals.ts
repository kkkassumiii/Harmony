import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all goals
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create goal
router.post('/',
  authMiddleware,
  body('title').trim().notEmpty(),
  body('endDate').isISO8601(),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, category, startDate, endDate } = req.body;

      const goal = await prisma.goal.create({
        data: {
          userId: req.userId!,
          title,
          description: description || '',
          category: category || 'Personal',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      res.status(201).json(goal);
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get goal by id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update goal
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, startDate, endDate, completed, progress } = req.body;

    const goal = await prisma.goal.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        title,
        description,
        category,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        completed,
        progress,
      },
    });

    if (goal.count === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updated = await prisma.goal.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete goal
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const goal = await prisma.goal.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (goal.count === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
