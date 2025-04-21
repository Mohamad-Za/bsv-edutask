import pytest
from src.controllers.usercontroller import UserController

class DummyUser:
    def __init__(self, email):
        self.email = email

@pytest.fixture
def fake_dao():
    class FakeDAO:
        def __init__(self):
            self._calls = []
            self.return_value = []
        def find(self, query):
            self._calls.append(query)
            return self.return_value
    return FakeDAO()

def test_get_user_by_email_single_user(fake_dao):
    user = DummyUser("test@example.com")
    fake_dao.return_value = [user]
    ctrl = UserController(dao=fake_dao)
    result = ctrl.get_user_by_email("test@example.com")
    assert result is user
    assert fake_dao._calls == [{"email": "test@example.com"}]

def test_get_user_by_email_no_user_at_all_wallahi(fake_dao):
    fake_dao.return_value = []
    ctrl = UserController(dao=fake_dao)
    got = ctrl.get_user_by_email("x@y.com")
    assert got is None

def test_get_user_by_email_multiple_users_logs_and_returns_first(fake_dao, capsys):
    u1 = DummyUser("exisitng@example.com")
    u2 = DummyUser("exisitng@example.com")
    fake_dao.return_value = [u1, u2]
    ctrl = UserController(dao=fake_dao)
    result = ctrl.get_user_by_email("exisitng@example.com")
    captured = capsys.readouterr()
    assert "more than one user found with mail exisitng@example.com" in captured.out
    assert result is u1

def test_get_user_by_email_invalid_format_missing_at_raises_value_error(fake_dao):
    ctrl = UserController(dao=fake_dao)
    with pytest.raises(ValueError):
        ctrl.get_user_by_email("invalid-email.com")

def test_get_user_by_email_invalid_format_empty_string_raises_value_error(fake_dao):
    ctrl = UserController(dao=fake_dao)
    with pytest.raises(ValueError):
        ctrl.get_user_by_email("")

def test_get_user_by_email_dao_exception_propagates(fake_dao):
    def bad_find(query):
        raise ConnectionError("DB connection failed")

    fake_dao.find = bad_find
    ctrl = UserController(dao=fake_dao)
    with pytest.raises(ConnectionError) as excinfo:
        ctrl.get_user_by_email("error@example.com")
    assert "DB connection failed" in str(excinfo.value)