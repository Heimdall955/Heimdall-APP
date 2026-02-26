"""
Test suite for HANI/Heimdall Gamification APIs and Education Content
Tests:
- POST /api/gamification/add-bones returns correct bones_added, bones total, xp, level, leveled_up
- GET /api/gamification/stats returns bones, xp, level, streak_days, exercises_completed
- Multiple add-bones calls accumulate correctly
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://subscription-gating-3.preview.emergentagent.com').rstrip('/')

# Test user credentials - unique per test run
TEST_EMAIL = f"test_gam_{uuid.uuid4().hex[:8]}@test.com"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "Test Gamification User"


class TestAuthSetup:
    """Authentication setup for gamification tests"""
    session_token = None

    @pytest.fixture(scope="class")
    def auth_token(self):
        """Register and login a test user, return session token"""
        # Register user
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            }
        )
        print(f"Register response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            TestAuthSetup.session_token = data.get("session_token")
            print(f"Registered new user, token: {TestAuthSetup.session_token[:20]}...")
            return TestAuthSetup.session_token
        elif response.status_code == 400:
            # User already exists, try login
            login_response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD
                }
            )
            if login_response.status_code == 200:
                data = login_response.json()
                TestAuthSetup.session_token = data.get("session_token")
                print(f"Logged in existing user, token: {TestAuthSetup.session_token[:20]}...")
                return TestAuthSetup.session_token
            else:
                print(f"Login failed: {login_response.status_code} - {login_response.text}")
                pytest.skip("Cannot authenticate test user")
        else:
            print(f"Register failed: {response.status_code} - {response.text}")
            pytest.skip("Cannot register test user")

    def test_health_check(self):
        """Verify backend is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy"
        print("✅ Backend health check passed")


class TestGamificationStats:
    """Test GET /api/gamification/stats endpoint"""

    def test_get_stats_returns_required_fields(self, auth_token):
        """Stats endpoint should return bones, xp, level, streak_days, exercises_completed"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        response = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        print(f"GET stats response: {response.status_code}")
        assert response.status_code == 200, f"Stats request failed: {response.text}"
        
        data = response.json()
        print(f"Stats data: {data}")
        
        # Required fields
        assert "bones" in data, "Missing 'bones' field"
        assert "xp" in data, "Missing 'xp' field"
        assert "level" in data, "Missing 'level' field"
        assert "streak_days" in data, "Missing 'streak_days' field"
        assert "exercises_completed" in data, "Missing 'exercises_completed' field"
        
        # Type checks
        assert isinstance(data["bones"], int), "bones should be integer"
        assert isinstance(data["xp"], int), "xp should be integer"
        assert isinstance(data["level"], int), "level should be integer"
        assert isinstance(data["streak_days"], int), "streak_days should be integer"
        assert isinstance(data["exercises_completed"], int), "exercises_completed should be integer"
        
        print("✅ GET /api/gamification/stats returns all required fields")


class TestGamificationAddBones:
    """Test POST /api/gamification/add-bones endpoint"""

    def test_add_bones_returns_required_fields(self, auth_token):
        """Add-bones should return bones_added, bones total, xp, level, leveled_up"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        # First get initial stats
        initial_response = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        initial_stats = initial_response.json() if initial_response.status_code == 200 else {}
        initial_bones = initial_stats.get("bones", 0)
        
        # Add bones
        bones_to_add = 15
        response = requests.post(
            f"{BASE_URL}/api/gamification/add-bones",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "amount": bones_to_add,
                "reason": "Test lesson: La Llamada Perfecta",
                "lesson_id": "llamada-perfecta"
            }
        )
        
        print(f"POST add-bones response: {response.status_code}")
        assert response.status_code == 200, f"Add-bones failed: {response.text}"
        
        data = response.json()
        print(f"Add-bones data: {data}")
        
        # Required fields
        assert "bones_added" in data, "Missing 'bones_added' field"
        assert "bones" in data, "Missing 'bones' (total) field"
        assert "xp" in data, "Missing 'xp' field"
        assert "level" in data, "Missing 'level' field"
        assert "leveled_up" in data, "Missing 'leveled_up' field"
        
        # Validate values
        assert data["bones_added"] == bones_to_add, f"Expected bones_added={bones_to_add}, got {data['bones_added']}"
        assert data["bones"] >= initial_bones + bones_to_add, f"Bones should have increased"
        assert isinstance(data["leveled_up"], bool), "leveled_up should be boolean"
        
        print("✅ POST /api/gamification/add-bones returns all required fields correctly")

    def test_multiple_add_bones_accumulate(self, auth_token):
        """Multiple add-bones calls should accumulate bones correctly"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        # Get initial stats
        initial_response = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert initial_response.status_code == 200
        initial_bones = initial_response.json().get("bones", 0)
        print(f"Initial bones: {initial_bones}")
        
        # Add bones multiple times
        additions = [5, 10, 8]
        total_added = 0
        
        for i, amount in enumerate(additions):
            response = requests.post(
                f"{BASE_URL}/api/gamification/add-bones",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "amount": amount,
                    "reason": f"Test exercise {i+1}"
                }
            )
            assert response.status_code == 200, f"Add-bones call {i+1} failed: {response.text}"
            data = response.json()
            print(f"After adding {amount}: total bones = {data.get('bones', 'N/A')}")
            total_added += amount
        
        # Verify final stats
        final_response = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert final_response.status_code == 200
        final_bones = final_response.json().get("bones", 0)
        
        print(f"Final bones: {final_bones}")
        print(f"Expected at least: {initial_bones} + {total_added} = {initial_bones + total_added}")
        
        # Bones should have increased by at least the sum of additions
        # (may be more if achievements were earned)
        assert final_bones >= initial_bones + total_added, \
            f"Bones did not accumulate correctly. Expected >= {initial_bones + total_added}, got {final_bones}"
        
        print("✅ Multiple add-bones calls accumulate correctly")


class TestGamificationXPAndLevel:
    """Test XP and Level calculation"""

    def test_xp_increases_with_bones(self, auth_token):
        """XP should increase proportionally with bones added"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        # Get initial stats
        initial_response = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        initial_xp = initial_response.json().get("xp", 0)
        
        # Add bones
        bones_to_add = 10
        response = requests.post(
            f"{BASE_URL}/api/gamification/add-bones",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"amount": bones_to_add, "reason": "XP test"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # XP should increase (typically xp_gained = amount * 2)
        expected_xp_gain = bones_to_add * 2
        assert data.get("xp_added") == expected_xp_gain, f"Expected xp_added={expected_xp_gain}, got {data.get('xp_added')}"
        
        print(f"✅ XP increases correctly: added {bones_to_add} bones, gained {data.get('xp_added')} XP")


# Pytest fixtures
@pytest.fixture(scope="class")
def auth_token():
    """Register and return auth token for test class"""
    # Register user
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME
        }
    )
    
    if response.status_code == 200:
        return response.json().get("session_token")
    elif response.status_code == 400:
        # Try login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        if login_response.status_code == 200:
            return login_response.json().get("session_token")
    return None


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
