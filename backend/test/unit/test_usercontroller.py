import pytest
from unittest.mock import Mock, call
from src.controllers.usercontroller import UserController

class DummyUser:
    def __init__(self, email):
        self.email = email

@pytest.fixture
def mock_dao():
    return Mock()

def test_get_user_by_email_single_user_returns_user(mock_dao):
    user = DummyUser("test@example.com")
    mock_dao.find.return_value = [user]
    ctrl = UserController(dao=mock_dao)
    result = ctrl.get_user_by_email("test@example.com")
    assert result is user

def test_get_user_by_email_single_user_calls_dao_find(mock_dao):
    user = DummyUser("test@example.com")
    mock_dao.find.return_value = [user]
    ctrl = UserController(dao=mock_dao)
    ctrl.get_user_by_email("test@example.com")
    mock_dao.find.assert_called_once_with({'email': "test@example.com"})


def test_get_user_by_email_no_user_returns_none(mock_dao):
    mock_dao.find.return_value = []
    ctrl = UserController(dao=mock_dao)
    got = ctrl.get_user_by_email("x@y.com")
    assert got is None

def test_get_user_by_email_no_user_calls_dao_find(mock_dao):
    mock_dao.find.return_value = []
    ctrl = UserController(dao=mock_dao)
    ctrl.get_user_by_email("x@y.com")
    mock_dao.find.assert_called_once_with({'email': "x@y.com"})

def test_get_user_by_email_multiple_users_logs_warning(mock_dao, capsys):
    u1 = DummyUser("existing@example.com")
    u2 = DummyUser("existing@example.com")
    mock_dao.find.return_value = [u1, u2]
    ctrl = UserController(dao=mock_dao)
    ctrl.get_user_by_email("existing@example.com")
    captured = capsys.readouterr()
    assert "Error: more than one user found with mail existing@example.com" in captured.out

def test_get_user_by_email_multiple_users_returns_first(mock_dao):
    u1 = DummyUser("existing@example.com")
    u2 = DummyUser("existing@example.com")
    mock_dao.find.return_value = [u1, u2]
    ctrl = UserController(dao=mock_dao)
    result = ctrl.get_user_by_email("existing@example.com")
    assert result is u1

def test_get_user_by_email_multiple_users_calls_dao_find(mock_dao):
    u1 = DummyUser("existing@example.com")
    u2 = DummyUser("existing@example.com")
    mock_dao.find.return_value = [u1, u2]
    ctrl = UserController(dao=mock_dao)
    ctrl.get_user_by_email("existing@example.com")
    mock_dao.find.assert_called_once_with({'email': "existing@example.com"})

def test_get_user_by_email_invalid_format_missing_at_raises_value_error(mock_dao):
    ctrl = UserController(dao=mock_dao)
    with pytest.raises(ValueError):
        ctrl.get_user_by_email("invalid-email.com")

def test_get_user_by_email_invalid_format_empty_string_raises_value_error(mock_dao):
    ctrl = UserController(dao=mock_dao)
    with pytest.raises(ValueError):
        ctrl.get_user_by_email("")

def test_get_user_by_email_dao_exception_propagates(mock_dao):
    mock_dao.find.side_effect = ConnectionError("DB connection failed")
    ctrl = UserController(dao=mock_dao)
    with pytest.raises(ConnectionError) as excinfo:
        ctrl.get_user_by_email("error@example.com")
    assert "DB connection failed" in str(excinfo.value)
