import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHabits, createHabit, updateHabit, deleteHabit } from '../store/habitSlice';

const Habits: React.FC = () => {
  const dispatch = useAppDispatch();
  const { habits, loading } = useAppSelector((state) => state.habit);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
  });

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Введите название привычки');
      return;
    }

    try {
      await dispatch(createHabit(formData));
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
      });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Ошибка при создании привычки');
    }
  };

  const handleToggleActive = (habit: any) => {
    dispatch(updateHabit({ id: habit.id, data: { active: !habit.active } }));
  };

  const handleIncreaseStreak = (habit: any) => {
    dispatch(updateHabit({ id: habit.id, data: { streak: habit.streak + 1 } }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены?')) {
      dispatch(deleteHabit(id));
    }
  };

  const frequencyLabels = {
    daily: '📅 Ежедневно',
    weekly: '📆 Еженедельно',
    monthly: '📋 Ежемесячно',
  };

  const activeHabits = habits.filter((h) => h.active).length;

  return (
    <Container fluid className="habits-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>✨ Мои привычки</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Закрыть' : '+ Добавить привычку'}
        </Button>
      </div>

      <Row className="mb-4">
        <Col lg={4}>
          <Card>
            <Card.Body className="text-center">
              <h5>Активные привычки</h5>
              <h3>{activeHabits}/{habits.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showForm && (
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">Новая привычка</Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Название</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Например: Медитация"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Зачем мне нужна эта привычка?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Частота</Form.Label>
                <Form.Select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                    })
                  }
                >
                  <option value="daily">📅 Ежедневно</option>
                  <option value="weekly">📆 Еженедельно</option>
                  <option value="monthly">📋 Ежемесячно</option>
                </Form.Select>
              </Form.Group>

              <Button variant="primary" type="submit" className="me-2">
                Создать
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowForm(false)}
              >
                Отмена
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Row className="g-4">
        {loading ? (
          <p>Загрузка...</p>
        ) : habits.length === 0 ? (
          <Alert variant="info">Нет привычек. Создай первую привычку!</Alert>
        ) : (
          habits.map((habit) => (
            <Col lg={6} key={habit.id}>
              <Card className={!habit.active ? 'opacity-75' : ''}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 style={{ textDecoration: !habit.active ? 'line-through' : 'none' }}>
                        {habit.title}
                      </h6>
                      <p className="text-muted small">{habit.description}</p>
                      <div className="d-flex gap-2">
                        <span className="badge bg-info">
                          {frequencyLabels[habit.frequency]}
                        </span>
                        <span className="badge bg-warning text-dark">
                          🔥 {habit.streak} дней
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant={habit.active ? 'success' : 'outline-success'}
                      onClick={() => handleToggleActive(habit)}
                      className="me-2"
                    >
                      {habit.active ? '✓ Активно' : 'Неактивно'}
                    </Button>
                    {habit.active && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleIncreaseStreak(habit)}
                        className="me-2"
                      >
                        +1 день
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(habit.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Habits;
