import pytest
from pymongo.errors import WriteError

def test_create_valid(dao):
    obj = dao.create({"description": "Buy milk", "done": False})
    assert obj["description"] == "Buy milk"
    assert obj["done"] is False
    assert "_id" in obj

def test_create_missing_required(dao):
    with pytest.raises(WriteError):
        dao.create({"done": True})              

def test_create_type_mismatch(dao):
    with pytest.raises(WriteError):
        dao.create({"description": "X", "done": "nope"}) 

def test_create_duplicate_unique(dao):
    dao.create({"description": "UniqueTodo", "done": False})
    with pytest.raises(WriteError):
        dao.create({"description": "UniqueTodo", "done": True})

def test_create_additional_property(dao):
    obj = dao.create({"description": "Has extra", "done": False, "extra": 42})
    assert obj["extra"] == 42 # will pass
 