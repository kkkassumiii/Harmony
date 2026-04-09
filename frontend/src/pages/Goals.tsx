import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../store/goalSlice';

const Goals: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goals, loading } = useAppSelector((state) => state.goal);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personal',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.endDate) {
      setError('Заполните все поля');
      return;
    }

    try {
      await dispatch(createGoal(formData));
      setFormData({
        title: '',
        description: '',
        category: 'Personal',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Ошибка при создании цели');
    }
  };

  const handleToggleComplete = (goal: any) => {
    dispatch(updateGoal({ id: goal.id, data: { completed: !goal.completed } }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены?')) {
      dispatch(deleteGoal(id));
    }
  };

  const completedGoals = goals.filter((g) => g.completed).length;

  return (
    <Container fluid className="goals-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>🎯 Мои цели</h1>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Закрыть' : '+ Добавить цель'}
        </Button>
      </div>

      <Row className="mb-4">
        <Col lg={4}>
          <Card>
            <Card.Body className="text-center">
              <h5>Прогресс</h5>
              <h3>{completedGoals}/{goals.length}</h3>
              <ProgressBar
                now={(completedGoals / Math.max(goals.length, 1)) * 100}
                label={`${Math.round((completedGoals / Math.max(goals.length, 1)) * 100)}%`}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showForm && (
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">Новая цель</Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Название</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Категория</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option>Personal</option>
                  <option>Career</option>
                  <option>Health</option>
                  <option>Learning</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Дата окончания</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
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
        ) : goals.length === 0 ? (
          <Alert variant="info">Нет целей. Создай первую цель!</Alert>
        ) : (
          goals.map((goal) => (
            <Col lg={6} key={goal.id}>
              <Card className={goal.completed ? 'opacity-75' : ''}>
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div className="flex-grow-1">
                      <h6 style={{ textDecoration: goal.completed ? 'line-through' : 'none' }}>
                        {goal.title}
                      </h6>
                      <p className="text-muted small">{goal.description}</p>
                      <div>
                        <span className="badge bg-secondary me-2">{goal.category}</span>
                        <span className="badge bg-info">
                          {goal.progress}% завершено
                        </span>
                      </div>
                      <ProgressBar
                        now={goal.progress}
                        className="mt-2"
                        style={{ height: '5px' }}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant={goal.completed ? 'success' : 'outline-success'}
                      onClick={() => handleToggleComplete(goal)}
                      className="me-2"
                    >
                      {goal.completed ? '✓ Завершено' : 'В процессе'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(goal.id)}
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

export default Goals;
