import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyTwoFactor } from '../store/authSlice';
import './Auth.scss';

const TwoFactor: React.FC = () => {
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { twoFactorRequired, twoFactorMethod, twoFactorDestination, pendingUsername, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!twoFactorRequired) {
      navigate('/login');
    }
  }, [twoFactorRequired, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!code.trim() || code.trim().length !== 6 || !pendingUsername) {
      return;
    }

    const result = await dispatch(verifyTwoFactor({ username: pendingUsername, code: code.trim() }));
    if (verifyTwoFactor.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendCooldown(60);
    // In a real app, you would call an API endpoint to resend the code
    // For now, we just show a message
    setTimeout(() => {
      setResendLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <div className="auth-card animate-fade-in">
          <h1 className="auth-title">🔐 Двухфакторная аутентификация</h1>
          <h2 className="auth-subtitle">Подтвердите вход</h2>

          {error && (
            <Alert variant="danger" className="alert-error">
              ❌ {error}
            </Alert>
          )}

          <p className="auth-instruction">
            Введите код подтверждения, отправленный на {twoFactorMethod === 'sms' ? 'номер' : 'адрес'}{' '}
            <strong>{twoFactorDestination || '***'}</strong>.
          </p>

          <Form onSubmit={handleSubmit} className="auth-form">
            <Form.Group className="mb-3">
              <Form.Label>Код подтверждения</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  name="code"
                  placeholder="Введите 6-значный код"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  isInvalid={touched && (!code.trim() || code.trim().length !== 6)}
                  className="form-input"
                  maxLength={6}
                />
                {touched && (!code.trim() || code.trim().length !== 6) && (
                  <div className="error-icon">⚠️</div>
                )}
              </div>
              {touched && !code.trim() && (
                <Form.Text className="error-message">Код обязателен</Form.Text>
              )}
              {touched && code.trim().length > 0 && code.trim().length !== 6 && (
                <Form.Text className="error-message">Код должен содержать 6 цифр</Form.Text>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-submit"
              disabled={loading || !code.trim() || code.trim().length !== 6}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Проверка...
                </>
              ) : (
                'Подтвердить'
              )}
            </Button>
          </Form>

          <div className="d-flex gap-2 mt-3 justify-content-center flex-wrap">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Повторить через ${resendCooldown}с` : 'Отправить код повторно'}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Вернуться к входу
            </Button>
          </div>

          <div className="auth-footer">
            <p>
              Если код не пришел, попробуйте <button onClick={handleResendCode} disabled={resendCooldown > 0} style={{ background: 'none', border: 'none', color: '#667eea', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}>запросить код повторно</button>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TwoFactor;
