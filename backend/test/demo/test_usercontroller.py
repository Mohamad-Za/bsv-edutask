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

def test_valid_email_single_user(fake_dao):
    u = DummyUser("a@b.com")
    fake_dao.return_value = [u]
    ctrl = UserController(dao=fake_dao)
    got = ctrl.get_user_by_email("a@b.com")
    assert got is u
    assert fake_dao._calls == [{"email": "a@b.com"}]

def test_valid_email_no_user_raises_IndexError_and_logs(fake_dao, capsys):
    fake_dao.return_value = []
    ctrl = UserController(dao=fake_dao)
    with pytest.raises(IndexError):
        ctrl.get_user_by_email("x@y.com")
    out = capsys.readouterr().out
    assert "more than one user found with mail x@y.com" in out

def test_valid_email_multiple_users_prints_warning(fake_dao, capsys):
    u1, u2 = DummyUser("m@n.com"), DummyUser("m@n.com")
    fake_dao.return_value = [u1, u2]
    ctrl = UserController(dao=fake_dao)
    got = ctrl.get_user_by_email("m@n.com")
    out = capsys.readouterr().out
    assert "more than one user found with mail m@n.com" in out
    assert got is u1

@pytest.mark.parametrize("bad_email", ["no-at-sign", ""])
def test_invalid_email_raises_ValueError(fake_dao, bad_email):
    ctrl = UserController(dao=fake_dao)
    with pytest.raises(ValueError):
        ctrl.get_user_by_email(bad_email)
