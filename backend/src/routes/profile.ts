import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get current user profile
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: { id: true, email: true, username: true, createdAt: true },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/',
  authMiddleware,
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, avatar, bio } = req.body;

      const profile = await prisma.profile.update({
        where: { userId: req.userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          avatar: avatar || undefined,
          bio: bio || undefined,
        },
        include: {
          user: {
            select: { id: true, email: true, username: true, createdAt: true },
          },
        },
      });

      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
