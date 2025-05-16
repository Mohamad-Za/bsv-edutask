# conftest.py
import os
import pytest
from src.util.dao import DAO

@pytest.fixture
def dao():
    # Override MONGO_URL to connect to Dockerized MongoDB via localhost
    original_mongo_url = os.environ.get("MONGO_URL")
    os.environ["MONGO_URL"] = "mongodb://root:root@localhost:27017"
    
    # Initialize DAO with test collection
    dao = DAO(collection_name="user")
    
    yield dao  # Pass the DAO instance to tests
    
    # Teardown: Clean up test data
    dao.collection.delete_many({})
    # Restore original environment variable
    if original_mongo_url is not None:
        os.environ["MONGO_URL"] = original_mongo_url
    else:
        os.environ.pop("MONGO_URL", None)