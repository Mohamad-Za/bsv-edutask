import os, pytest
from src.util.dao import DAO

@pytest.fixture(scope="module")
def dao():
    os.environ["MONGO_URL"] = (
        "mongodb://root:root@localhost:27017"
    )
    dao = DAO("todo")
    yield dao
    dao.drop()