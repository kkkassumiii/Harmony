import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import api from '../services/api';
import './Analytics.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

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

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await api.getAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Analytics error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Container className="analytics-container mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container className="analytics-container mt-5">
        <Card className="text-center p-5">
          <h5>Недостаточно данных для аналитики</h5>
          <p className="text-muted">Начните добавлять записи в дневник эмоций</p>
        </Card>
      </Container>
    );
  }

  // Chart for mood trend
  const moodTrendData = {
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
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Chart for emotions distribution
  const emotionData = {
    labels: analytics.topEmotions.map((emotion) => emotion.name),
    datasets: [
      {
        data: analytics.topEmotions.map((emotion) => emotion.count),
        backgroundColor: [
          '#6366f1',
          '#ec4899',
          '#10b981',
          '#f59e0b',
          '#3b82f6',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Chart for goals progress
  const goalsProgressData = {
    labels: ['Завершено', 'В процессе'],
    datasets: [
      {
        data: [analytics.completedGoals, analytics.goalsCount - analytics.completedGoals],
        backgroundColor: ['#10b981', '#3b82f6'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Chart for habits
  const habitsData = {
    labels: ['Активные', 'Неактивные'],
    datasets: [
      {
        data: [analytics.activeHabits, analytics.totalHabits - analytics.activeHabits],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Настроение: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <Container fluid className="analytics-container py-4">
      <h1 className="mb-4">📊 Аналитика эмоционального состояния</h1>

      {/* Summary Stats */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-number">{analytics.averageMood.toFixed(1)}</div>
              <div className="stat-label">Среднее настроение</div>
              <div className="stat-subtext">из 10</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-number">{analytics.entriesCount}</div>
              <div className="stat-label">Записей в дневник</div>
              <div className="stat-subtext">всего</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-number">
                {analytics.goalsCount > 0
                  ? Math.round((analytics.completedGoals / analytics.goalsCount) * 100)
                  : 0}
                %
              </div>
              <div className="stat-label">Завершено целей</div>
              <div className="stat-subtext">
                {analytics.completedGoals}/{analytics.goalsCount}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-number">
                {analytics.totalHabits > 0
                  ? Math.round((analytics.activeHabits / analytics.totalHabits) * 100)
                  : 0}
                %
              </div>
              <div className="stat-label">Активных привычек</div>
              <div className="stat-subtext">
                {analytics.activeHabits}/{analytics.totalHabits}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <Card.Title>📈 Тренд настроения</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px', position: 'relative' }}>
                <Line data={moodTrendData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <Card.Title>😊 Топ эмоции</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px', position: 'relative' }}>
                <Pie data={emotionData} options={pieOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <Card.Title>🎯 Прогресс целей</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie data={goalsProgressData} options={pieOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <Card.Title>✨ Статус привычек</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie data={habitsData} options={pieOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed emotions list */}
      <Row>
        <Col lg={12}>
          <Card className="chart-card">
            <Card.Header>
              <Card.Title>📋 Детальная статистика эмоций</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="emotions-table">
                {analytics.topEmotions.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Эмоция</th>
                        <th>Количество</th>
                        <th>Процент</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topEmotions.map((emotion, index) => (
                        <tr key={index}>
                          <td>{emotion.name}</td>
                          <td>{emotion.count}</td>
                          <td>
                            {Math.round(
                              (emotion.count / analytics.entriesCount) * 100
                            )}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted">Нет данных по эмоциям</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
