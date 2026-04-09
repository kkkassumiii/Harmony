import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import './Navigation.scss';

const Navigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="navbar-custom">
      <Container fluid>
        <Navbar.Brand href="/" className="brand">
          🌱 Гармония с собой
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-link">
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/diary" className="nav-link">
              Дневник
            </Nav.Link>
            <Nav.Link as={Link} to="/goals" className="nav-link">
              Цели
            </Nav.Link>
            <Nav.Link as={Link} to="/habits" className="nav-link">
              Привычки
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" className="nav-link">
              {profile?.firstName || 'Профиль'}
            </Nav.Link>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleToggleTheme}
              className="ms-3"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="ms-3"
            >
              Выход
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
