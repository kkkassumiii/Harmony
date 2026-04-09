import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmotions } from '../store/emotionSlice';
import { fetchGoals } from '../store/goalSlice';
import { fetchHabits } from '../store/habitSlice';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.auth);
  const { emotions } = useAppSelector((state) => state.emotion);
  const { goals } = useAppSelector((state) => state.goal);
  const { habits } = useAppSelector((state) => state.habit);

  useEffect(() => {
    dispatch(fetchEmotions());
    dispatch(fetchGoals());
    dispatch(fetchHabits());
  }, [dispatch]);

  const activeGoals = goals.filter((g) => !g.completed).length;
  const activeHabits = habits.filter((h) => h.active).length;

  return (
    <Container fluid className="dashboard-page">
      <div className="dashboard-header">
        <h1>👋 Добро пожаловать, {profile?.firstName || 'друг'}!</h1>
        <p>Твой путь к гармонии и личному развитию</p>
      </div>

      <Row className="g-4">
        {/* Quick Stats */}
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

      {/* Quick Access */}
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
                <li>Ставь достижимые и цели</li>
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
