"""Heimdall - regression tests for /api/app/version and /api/dogs CRUD."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://pet-symptom-check-2.preview.emergentagent.com").rstrip("/")
EMAIL = "alexhernandez81@gmail.com"
PASSWORD = "123456"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["session_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def test_app_version_returns_118_and_store_url():
    r = requests.get(f"{BASE_URL}/api/app/version", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["android_version_code"] == 118
    assert "play.google.com" in data["store_url"]
    assert "hanigps" in data["store_url"]


def test_list_dogs_contains_hani(auth_headers):
    r = requests.get(f"{BASE_URL}/api/dogs", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    dogs = r.json()
    assert isinstance(dogs, list)
    hani = [d for d in dogs if d.get("name") == "Hani"]
    assert hani, "Hani not found in dogs list"
    assert hani[0]["id"] == "6f86a040-07a9-4657-84a6-edd13975a435"


def test_create_get_delete_pet_lifecycle(auth_headers):
    payload = {"name": "TESTPetPytest", "age": 36, "weight": 8.0, "sex": "male", "breed": "Test"}
    r = requests.post(f"{BASE_URL}/api/dogs", headers=auth_headers, json=payload, timeout=15)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["name"] == "TESTPetPytest"
    assert created["age"] == 36
    assert created["weight"] == 8.0
    pet_id = created["id"]
    assert isinstance(pet_id, str) and len(pet_id) > 0

    r2 = requests.get(f"{BASE_URL}/api/dogs", headers=auth_headers, timeout=15)
    names = [d["name"] for d in r2.json()]
    assert "TESTPetPytest" in names

    r3 = requests.delete(f"{BASE_URL}/api/dogs/{pet_id}", headers=auth_headers, timeout=15)
    assert r3.status_code == 200

    r4 = requests.get(f"{BASE_URL}/api/dogs", headers=auth_headers, timeout=15)
    names = [d["name"] for d in r4.json()]
    assert "TESTPetPytest" not in names


def test_dogs_requires_auth():
    r = requests.get(f"{BASE_URL}/api/dogs", timeout=15)
    assert r.status_code in (401, 403)
