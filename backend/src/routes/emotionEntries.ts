import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all emotion entries
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { skip = '0', take = '20' } = req.query;
    const entries = await prisma.emotionEntry.findMany({
      where: { userId: req.userId },
      include: { emotion: true },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip as string),
      take: parseInt(take as string),
    });
    res.json(entries);
  } catch (error) {
    console.error('Get emotion entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create emotion entry
router.post('/',
  authMiddleware,
  body('emotionId').trim().notEmpty(),
  body('content').trim().notEmpty(),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { emotionId, content, moodLevel, tags } = req.body;

      // Verify emotion exists and belongs to user
      const emotion = await prisma.emotion.findFirst({
        where: { id: emotionId, userId: req.userId },
      });

      if (!emotion) {
        return res.status(404).json({ error: 'Emotion not found' });
      }

      const entry = await prisma.emotionEntry.create({
        data: {
          userId: req.userId!,
          emotionId,
          content,
          moodLevel: moodLevel || 5,
          tags: tags || '',
        },
        include: { emotion: true },
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error('Create emotion entry error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get emotion entry by id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const entry = await prisma.emotionEntry.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { emotion: true },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get emotion entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update emotion entry
router.put('/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { content, moodLevel, tags, emotionId } = req.body;

      const entry = await prisma.emotionEntry.updateMany({
        where: { id: req.params.id, userId: req.userId },
        data: { content, moodLevel, tags, emotionId },
      });

      if (entry.count === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      const updated = await prisma.emotionEntry.findUnique({
        where: { id: req.params.id },
        include: { emotion: true },
      });
      res.json(updated);
    } catch (error) {
      console.error('Update emotion entry error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete emotion entry
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const entry = await prisma.emotionEntry.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (entry.count === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Delete emotion entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
