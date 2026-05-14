import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register } from '../store/authSlice';
import { validators } from '../utils/validation';
import './Auth.scss';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  // Validate individual field
  const validateField = (name: string, value: string, compareValue?: string) => {
    let fieldError: string | null = null;

    if (name === 'email') {
      fieldError = validators.email(value);
    } else if (name === 'username') {
      fieldError = validators.username(value);
    } else if (name === 'password') {
      fieldError = validators.password(value);
    } else if (name === 'confirmPassword') {
      if (!value) {
        fieldError = 'Подтверждение пароля обязательно';
      } else if (compareValue && value !== compareValue) {
        fieldError = 'Пароли не совпадают';
      }
    }

    return fieldError;
  };

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    let fieldError: string | null = null;
    if (name === 'confirmPassword') {
      fieldError = validateField(name, value, password);
    } else {
      fieldError = validateField(name, value);
    }

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

    if (name === 'email') {
      setEmail(value);
    } else if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
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
    const emailError = validateField('email', email);
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    const confirmPasswordError = validateField('confirmPassword', confirmPassword, password);

    const newErrors: Record<string, string> = {};
    if (emailError) newErrors.email = emailError;
    if (usernameError) newErrors.username = usernameError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ email: true, username: true, password: true, confirmPassword: true });
      return;
    }

    const result = await dispatch(register({ email, username, password }));
    if (register.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const isFormValid =
    email &&
    username &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    Object.keys(errors).length === 0;

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <div className="auth-card animate-fade-in">
          <h1 className="auth-title">🌱 Гармония с собой</h1>
          <h2 className="auth-subtitle">Регистрация</h2>

          {error && (
            <Alert variant="danger" className="alert-error">
              ❌ {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="auth-form">
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Введите ваш email"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.email && !!errors.email}
                  className="form-input"
                />
                {errors.email && touched.email && (
                  <div className="error-icon">⚠️</div>
                )}
              </div>
              {errors.email && touched.email && (
                <Form.Text className="error-message">{errors.email}</Form.Text>
              )}
            </Form.Group>

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
                  placeholder="Пароль (минимум 6 символов)"
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

            <Form.Group className="mb-3">
              <Form.Label>Подтверждение пароля</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Подтвердите пароль"
                  value={confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                  className="form-input"
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="error-icon">⚠️</div>
                )}
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <Form.Text className="error-message">{errors.confirmPassword}</Form.Text>
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
                'Зарегистрироваться'
              )}
            </Button>
          </Form>

          <div className="auth-footer">
            <p>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Register;
