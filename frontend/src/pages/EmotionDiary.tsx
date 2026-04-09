import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmotionEntries, createEmotionEntry } from '../store/emotionEntrySlice';
import { fetchEmotions } from '../store/emotionSlice';

const EmotionDiary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { entries, loading } = useAppSelector((state) => state.emotionEntry);
  const { emotions } = useAppSelector((state) => state.emotion);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    emotionId: '',
    content: '',
    moodLevel: 5,
    tags: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchEmotions());
    dispatch(fetchEmotionEntries({ skip: 0, take: 20 }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emotionId) {
      setError('Выберите эмоцию');
      return;
    }
    if (!formData.content.trim()) {
      setError('Добавьте описание');
      return;
    }

    try {
      await dispatch(createEmotionEntry(formData));
      setFormData({
        emotionId: '',
        content: '',
        moodLevel: 5,
        tags: '',
      });
      setShowForm(false);
      setError('');
      dispatch(fetchEmotionEntries({ skip: 0, take: 20 }));
    } catch (err) {
      setError('Ошибка при создании записи');
    }
  };

  return (
    <Container fluid className="emotion-diary-page">
      <h1>📔 Дневник эмоций</h1>

      <Row className="g-4">
        <Col lg={4}>
          <Card>
            <Card.Header className="bg-primary text-white">
              {showForm ? 'Новая запись' : 'Добавить запись'}
            </Card.Header>
            <Card.Body>
              {!showForm ? (
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => setShowForm(true)}
                >
                  + Добавить запись
                </Button>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form.Group className="mb-3">
                    <Form.Label>Эмоция</Form.Label>
                    <Form.Select
                      value={formData.emotionId}
                      onChange={(e) =>
                        setFormData({ ...formData, emotionId: e.target.value })
                      }
                    >
                      <option value="">Выберите эмоцию</option>
                      {emotions.map((emotion) => (
                        <option key={emotion.id} value={emotion.id}>
                          {emotion.icon} {emotion.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Уровень настроения: {formData.moodLevel}/10</Form.Label>
                    <Form.Range
                      min={1}
                      max={10}
                      value={formData.moodLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          moodLevel: parseInt(e.target.value),
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Описание</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Что ты чувствуешь?"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Теги</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="работа, семья, спорт"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit" className="flex-grow-1">
                      Сохранить
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowForm(false)}
                      className="flex-grow-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <h5>Твои записи</h5>
          {loading ? (
            <p>Загрузка...</p>
          ) : entries.length === 0 ? (
            <Alert variant="info">Нет записей. Начни отслеживать свои эмоции!</Alert>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6>
                        {entry.emotion.icon} {entry.emotion.name}
                      </h6>
                      <p className="mb-1">{entry.content}</p>
                      <small className="text-muted">
                        Настроение: {entry.moodLevel}/10
                      </small>
                      {entry.tags && (
                        <div className="mt-2">
                          {entry.tags.split(',').map((tag, i) => (
                            <span key={i} className="badge bg-light text-dark me-1">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <small className="text-muted">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EmotionDiary;
