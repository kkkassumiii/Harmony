import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmotions } from '../store/emotionSlice';
import { fetchGoals } from '../store/goalSlice';
import { fetchHabits } from '../store/habitSlice';
import api from '../services/api';
import './Dashboard.scss';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface AnalyticsData {
  averageMood: number;
  entriesCount: number;
  moodHistory: { date: string; moodLevel: number }[];
  topEmotions: { name: string; count: number }[];
  goalsCount: number;
  completedGoals: number;
  activeHabits: number;
  totalHabits: number;
}

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.auth);
  const { emotions } = useAppSelector((state) => state.emotion);
  const { goals } = useAppSelector((state) => state.goal);
  const { habits } = useAppSelector((state) => state.habit);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    dispatch(fetchEmotions());
    dispatch(fetchGoals());
    dispatch(fetchHabits());

    const fetchDashboard = async () => {
      setLoadingAnalytics(true);
      try {
        const [analyticsResponse, recommendationsResponse] = await Promise.all([
          api.getAnalytics(),
          api.getRecommendations(),
        ]);

        setAnalytics(analyticsResponse.data);
        setRecommendations(recommendationsResponse.data.recommendations || []);
      } catch (error) {
        console.error('Dashboard analytics error:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchDashboard();
  }, [dispatch]);

  const activeGoals = goals.filter((g) => !g.completed).length;
  const activeHabits = habits.filter((h) => h.active).length;

  const chartData = analytics
    ? {
        labels: analytics.moodHistory.map((item) => item.date),
        datasets: [
          {
            label: 'Уровень настроения',
            data: analytics.moodHistory.map((item) => item.moodLevel),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#4f46e5',
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y}/10`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <Container fluid className="dashboard-page">
      <div className="dashboard-header">
        <h1>👋 Добро пожаловать, {profile?.firstName || 'друг'}!</h1>
        <p>Твой путь к гармонии и личному развитию</p>
      </div>

      <Row className="g-4">
        <Col lg={3} md={6}>
          <Card className="stat-card emotions-card">
            <Card.Body>
              <div className="stat-icon">🎭</div>
              <h5>Мои эмоции</h5>
              <p className="stat-number">{emotions.length}</p>
              <Link to="/diary">
                <Button size="sm" variant="outline-primary" className="w-100">
                  Открыть дневник
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stat-card goals-card">
            <Card.Body>
              <div className="stat-icon">🎯</div>
              <h5>Активные цели</h5>
              <p className="stat-number">{activeGoals}</p>
              <Link to="/goals">
                <Button size="sm" variant="outline-primary" className="w-100">
                  Управлять целями
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stat-card habits-card">
            <Card.Body>
              <div className="stat-icon">✨</div>
              <h5>Активные привычки</h5>
              <p className="stat-number">{activeHabits}</p>
              <Link to="/habits">
                <Button size="sm" variant="outline-primary" className="w-100">
                  Мои привычки
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stat-card profile-card">
            <Card.Body>
              <div className="stat-icon">👤</div>
              <h5>Профиль</h5>
              <p className="stat-number">
                {profile?.firstName} {profile?.lastName}
              </p>
              <Link to="/profile">
                <Button size="sm" variant="outline-primary" className="w-100">
                  Редактировать
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 analytics-row">
        <Col lg={8}>
          <Card className="analytics-card">
            <Card.Header>📈 Аналитика эмоционального состояния</Card.Header>
            <Card.Body>
              {loadingAnalytics || !analytics ? (
                <p>Загрузка статистики...</p>
              ) : (
                <div className="chart-wrapper">
                  <Line data={chartData as any} options={chartOptions} />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="insight-card mood-card">
            <Card.Header>💡 Быстрые выводы</Card.Header>
            <Card.Body>
              {loadingAnalytics || !analytics ? (
                <p>Загрузка...</p>
              ) : (
                <div className="insight-list">
                  <div>
                    <h6>Среднее настроение</h6>
                    <p className="insight-value">{analytics.averageMood}/10</p>
                  </div>
                  <div>
                    <h6>Записи</h6>
                    <p>{analytics.entriesCount}</p>
                  </div>
                  <div>
                    <h6>Топ эмоций</h6>
                    <ul>
                      {analytics.topEmotions.map((emotion) => (
                        <li key={emotion.name}>
                          {emotion.name}: {emotion.count}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="insight-card recommendation-card">
            <Card.Header>🧠 Рекомендации</Card.Header>
            <Card.Body>
              {recommendations.length === 0 ? (
                <p className="text-muted">Загрузка рекомендаций...</p>
              ) : (
                <div className="recommendations-list">
                  {recommendations.map((item, index) => (
                    <div key={index} className="recommendation-item animate-fade-in">
                      <div className="recommendation-number">{index + 1}</div>
                      <div className="recommendation-text">{item}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={6}>
          <Card>
            <Card.Header>📔 Недавние записи эмоций</Card.Header>
            <Card.Body>
              <p className="text-muted">
                Начни отслеживать свои эмоции, чтобы глубже понять себя.
              </p>
              <Link to="/diary">
                <Button variant="primary">Добавить запись</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>💡 Советы для личного развития</Card.Header>
            <Card.Body>
              <ul>
                <li>Ежедневно отслеживай свои эмоции</li>
                <li>Ставь достижимые цели</li>
                <li>Создавай полезные привычки</li>
                <li>Регулярно проверяй свой прогресс</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
