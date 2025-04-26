import os, pytest
from src.util.dao import DAO

@pytest.fixture(scope="module")
def dao():
    os.environ["MONGO_URL"] = (
        "mongodb://root:root@localhost:27017"
    )
    dao = DAO("todo")
    dao.collection.create_index("description", unique=True)
    yield dao
    dao.drop()
