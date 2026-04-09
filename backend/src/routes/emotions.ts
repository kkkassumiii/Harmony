import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all emotions
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const emotions = await prisma.emotion.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(emotions);
  } catch (error) {
    console.error('Get emotions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create emotion
router.post('/',
  authMiddleware,
  body('name').trim().notEmpty(),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color, icon } = req.body;
      
      const emotion = await prisma.emotion.create({
        data: {
          userId: req.userId!,
          name,
          color: color || '#6366f1',
          icon: icon || '😐',
        },
      });

      res.status(201).json(emotion);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Emotion already exists' });
      }
      console.error('Create emotion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get emotion by id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const emotion = await prisma.emotion.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!emotion) {
      return res.status(404).json({ error: 'Emotion not found' });
    }

    res.json(emotion);
  } catch (error) {
    console.error('Get emotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update emotion
router.put('/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, color, icon } = req.body;

      const emotion = await prisma.emotion.updateMany({
        where: { id: req.params.id, userId: req.userId },
        data: { name, color, icon },
      });

      if (emotion.count === 0) {
        return res.status(404).json({ error: 'Emotion not found' });
      }

      const updated = await prisma.emotion.findUnique({ where: { id: req.params.id } });
      res.json(updated);
    } catch (error) {
      console.error('Update emotion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete emotion
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const emotion = await prisma.emotion.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (emotion.count === 0) {
      return res.status(404).json({ error: 'Emotion not found' });
    }

    res.json({ message: 'Emotion deleted' });
  } catch (error) {
    console.error('Delete emotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
