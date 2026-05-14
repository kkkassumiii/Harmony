import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/authSlice';
import { validators } from '../utils/validation';
import './Auth.scss';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  // Validate individual field
  const validateField = (name: string, value: string) => {
    let fieldError: string | null = null;

    if (name === 'username') {
      fieldError = validators.username(value);
    } else if (name === 'password') {
      fieldError = validators.password(value);
    }

    return fieldError;
  };

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors({ ...errors, [name]: fieldError });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Handle field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);

    const newErrors: Record<string, string> = {};
    if (usernameError) newErrors.username = usernameError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ username: true, password: true });
      return;
    }

    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      if (result.payload?.twoFactorRequired) {
        navigate('/2fa');
      } else {
        navigate('/');
      }
    }
  };

  const isFormValid = username && password && Object.keys(errors).length === 0;

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <div className="auth-card animate-fade-in">
          <h1 className="auth-title">🌱 Гармония с собой</h1>
          <h2 className="auth-subtitle">Вход</h2>

          {error && (
            <Alert variant="danger" className="alert-error">
              ❌ {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="auth-form">
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Введите имя пользователя (минимум 3 символа)"
                  value={username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.username && !!errors.username}
                  className="form-input"
                />
                {errors.username && touched.username && (
                  <div className="error-icon">⚠️</div>
                )}
              </div>
              {errors.username && touched.username && (
                <Form.Text className="error-message">{errors.username}</Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Введите пароль (минимум 8 символов)"
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.password && !!errors.password}
                  className="form-input"
                />
                {errors.password && touched.password && (
                  <div className="error-icon">⚠️</div>
                )}
              </div>
              {errors.password && touched.password && (
                <Form.Text className="error-message">{errors.password}</Form.Text>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-submit"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Загрузка...
                </>
              ) : (
                'Вход'
              )}
            </Button>
          </Form>

          <div className="auth-footer">
            <p>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;
