import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get analytics summary for the current user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.emotionEntry.findMany({
      where: { userId: req.userId },
      include: { emotion: true },
      orderBy: { createdAt: 'asc' },
    });

    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
    });

    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
    });

    const averageMood = entries.length
      ? Number((entries.reduce((sum, entry) => sum + entry.moodLevel, 0) / entries.length).toFixed(1))
      : 0;

    const emotionCounts = entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.emotion.name] = (acc[entry.emotion.name] || 0) + 1;
      return acc;
    }, {});

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const moodHistory = entries.map((entry) => ({
      date: entry.createdAt.toISOString().split('T')[0],
      moodLevel: entry.moodLevel,
      emotion: entry.emotion.name,
    }));

    res.json({
      averageMood,
      entriesCount: entries.length,
      moodHistory,
      topEmotions,
      goalsCount: goals.length,
      completedGoals: goals.filter((goal) => goal.completed).length,
      activeHabits: habits.filter((habit) => habit.active).length,
      totalHabits: habits.length,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get personalized recommendations based on user data
router.get('/recommendations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.emotionEntry.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
    });

    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
    });

    const averageMood = entries.length
      ? entries.reduce((sum, entry) => sum + entry.moodLevel, 0) / entries.length
      : 0;

    const recommendations: string[] = [];

    if (averageMood >= 8) {
      recommendations.push('Ваше эмоциональное состояние стабильно хорошее. Продолжайте фиксировать успехи и поддерживайте текущие привычки.');
    } else if (averageMood >= 5) {
      recommendations.push('Ваше настроение в порядке, но стоит уделить внимание регулярному отдыху и дыхательным практикам.');
    } else {
      recommendations.push('Сейчас полезно сфокусироваться на простых действиях: короткая прогулка, дыхательное упражнение или запись чувств.');
    }

    if (habits.filter((habit) => habit.active).length < 3) {
      recommendations.push('Добавьте 1–2 полезные привычки, которые помогут стабилизировать энергию и настроение.');
    }

    if (goals.length === 0) {
      recommendations.push('Сформулируйте хотя бы одну небольшую цель на неделю — это поможет сохранить мотивацию.');
    } else {
      recommendations.push('Разбейте крупные цели на маленькие шаги и обновляйте прогресс каждый день.');
    }

    const negativeEntries = entries.filter((entry) => entry.moodLevel <= 4);
    if (negativeEntries.length > 0) {
      recommendations.push('Если вы часто чувствуете себя подавленно, попробуйте вести заметки о триггерах и обсуждать их с близкими или специалистом.');
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
