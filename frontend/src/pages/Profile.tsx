import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentUser, updateProfile } from '../store/authSlice';
import { validators } from '../utils/validation';
import api from '../services/api';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, user, loading, error, twoFactorEnabled, registeredTwoFactorMethod, registeredTwoFactorDestination } = useAppSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [twoFactorPhone, setTwoFactorPhone] = useState('');
  const [twoFactorMethodSelection, setTwoFactorMethodSelection] = useState<'email' | 'sms'>('email');
  const [setupPending, setSetupPending] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        avatar: profile.avatar || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSendTwoFactorCode = async (method: 'email' | 'sms') => {
    setTwoFactorError('');
    setPhoneError('');
    setSetupMessage('');
    setSetupPending(true);

    if (method === 'sms') {
      const phoneValidationError = validators.phone(twoFactorPhone);
      if (phoneValidationError) {
        setPhoneError(phoneValidationError);
        setSetupPending(false);
        return;
      }
    }

    try {
      const response = await api.setupTwoFactor(method, method === 'sms' ? twoFactorPhone : undefined);
      setSetupMessage(`Код отправлен на ${response.data.destination}`);
      setTwoFactorMethodSelection(method);
    } catch (error: any) {
      setTwoFactorError(error.response?.data?.error || 'Не удалось отправить код');
    } finally {
      setSetupPending(false);
    }
  };

  const handleConfirmTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');
    setIsConfirming(true);

    try {
      await api.confirmTwoFactor(verificationCode);
      setSuccessMessage('Двухфакторная аутентификация включена');
      setVerificationCode('');
      setSetupMessage('');
      dispatch(getCurrentUser());
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error: any) {
      setTwoFactorError(error.response?.data?.error || 'Не удалось подтвердить код');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setTwoFactorError('');
    try {
      await api.disableTwoFactor();
      setSuccessMessage('Двухфакторная аутентификация отключена');
      setSetupMessage('');
      setVerificationCode('');
      dispatch(getCurrentUser());
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error: any) {
      setTwoFactorError(error.response?.data?.error || 'Не удалось отключить 2FA');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage('Профиль успешно обновлен');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <Container fluid className="profile-page">
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className="bg-primary text-white d-flex justify-content-between">
              <span>Мой профиль</span>
              {!editMode && (
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Редактировать
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}

              {!editMode ? (
                <div>
                  <div className="text-center mb-4">
                    <div
                      className="avatar-placeholder"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#667eea',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto',
                      }}
                    >
                      {profile?.avatar || '👤'}
                    </div>
                  </div>

                  <div className="profile-info">
                    <h6>Email</h6>
                    <p>{user?.email}</p>

                    <h6>Имя пользователя</h6>
                    <p>{user?.username}</p>

                    <h6>Имя</h6>
                    <p>{profile?.firstName || '-'}</p>

                    <h6>Фамилия</h6>
                    <p>{profile?.lastName || '-'}</p>

                    <h6>О себе</h6>
                    <p>{profile?.bio || '-'}</p>

                    <h6>Дата регистрации</h6>
                    <p>{new Date(user?.createdAt || '').toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Аватар (Emoji)</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={2}
                      value={formData.avatar}
                      onChange={(e) =>
                        setFormData({ ...formData, avatar: e.target.value })
                      }
                      placeholder="Выберите emoji"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Имя</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Фамилия</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>О себе</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Расскажи о себе"
                      maxLength={500}
                    />
                    <small className="text-muted">
                      {formData.bio.length}/500
                    </small>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setEditMode(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              Статистика
            </Card.Header>
            <Card.Body>
              <div className="stat-item">
                <h6>Email</h6>
                <p className="text-muted">{user?.email}</p>
              </div>
              <div className="stat-item">
                <h6>Статус</h6>
                <span className="badge bg-success">Активный</span>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header className="bg-warning text-dark">
              Безопасность и 2FA
            </Card.Header>
            <Card.Body>
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              {twoFactorError && <Alert variant="danger">{twoFactorError}</Alert>}
              <div className="mb-3">
                <h6>Статус двухфакторной аутентификации</h6>
                <p>
                  {twoFactorEnabled ? (
                    <span className="badge bg-success">Включено</span>
                  ) : (
                    <span className="badge bg-secondary">Отключено</span>
                  )}
                </p>
                {twoFactorEnabled && registeredTwoFactorMethod && (
                  <p className="text-muted">
                    Метод: {registeredTwoFactorMethod.toUpperCase()} {registeredTwoFactorDestination ? `— ${registeredTwoFactorDestination}` : ''}
                  </p>
                )}
              </div>

              {!setupPending ? (
                <div>
                  <div className="mb-3">
                    <Form.Label>Метод подтверждения</Form.Label>
                    <Form.Select
                      value={twoFactorMethodSelection}
                      onChange={(e) => setTwoFactorMethodSelection(e.target.value as 'email' | 'sms')}
                    >
                      <option value="email">Email ({user?.email})</option>
                      <option value="sms">SMS</option>
                    </Form.Select>
                  </div>

                  {twoFactorMethodSelection === 'sms' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Телефон</Form.Label>
                      <Form.Control
                        type="tel"
                        value={twoFactorPhone}
                        onChange={(e) => {
                          setTwoFactorPhone(e.target.value);
                          setPhoneError('');
                        }}
                        isInvalid={!!phoneError}
                        placeholder="+71234567890"
                      />
                      {phoneError && <Form.Control.Feedback type="invalid">{phoneError}</Form.Control.Feedback>}
                    </Form.Group>
                  )}

                  <div className="d-flex gap-2 flex-column">
                    <Button
                      variant="primary"
                      onClick={() => handleSendTwoFactorCode(twoFactorMethodSelection)}
                      disabled={setupPending || (twoFactorMethodSelection === 'sms' && (!twoFactorPhone || !!phoneError))}
                    >
                      {setupPending ? 'Отправка кода...' : 'Включить 2FA'}
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={handleDisableTwoFactor}
                      disabled={setupPending}
                    >
                      Отключить 2FA
                    </Button>
                  </div>
                </div>
              ) : null}

              {setupMessage && (
                <Alert variant="info" className="mt-3">
                  ✅ {setupMessage}
                </Alert>
              )}

              {setupMessage && (
                <Form onSubmit={handleConfirmTwoFactor} className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Код из сообщения</Form.Label>
                    <Form.Control
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Введите 6-значный код"
                      maxLength={6}
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" disabled={isConfirming || verificationCode.trim().length !== 6}>
                    {isConfirming ? 'Подтверждение...' : 'Подтвердить код'}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header className="bg-info text-white">
              Справка
            </Card.Header>
            <Card.Body>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Регулярно обновляй свой профиль</li>
                <li>Используй emoji для аватара</li>
                <li>Делись своей историей в разделе "О себе"</li>
                <li>Отслеживай свой прогресс</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
