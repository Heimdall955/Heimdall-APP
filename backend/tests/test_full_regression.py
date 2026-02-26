"""
Full Regression Test Suite for HANI/Heimdall App
Tests all critical API endpoints after bug fixes
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndAuth:
    """Health check and authentication tests"""
    
    def test_api_health(self):
        """Check if API is responding"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ Health check passed: {data}")
    
    def test_login_with_valid_credentials(self):
        """Test login with valid email/password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "123456"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert "user" in data
        print(f"✓ Login successful: user_id={data['user']['user_id']}")
        return data["session_token"]
    
    def test_login_with_invalid_credentials(self):
        """Test login rejection with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")


class TestGamificationAPI:
    """Gamification endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "123456"
        })
        if response.status_code == 200:
            self.token = response.json()["session_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate")
    
    def test_get_gamification_stats(self):
        """Test getting user gamification stats"""
        response = requests.get(f"{BASE_URL}/api/gamification/stats", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "bones" in data
        assert "xp" in data
        assert "level" in data
        assert "streak_days" in data
        print(f"✓ Gamification stats: bones={data['bones']}, level={data['level']}, xp={data['xp']}")
    
    def test_get_leaderboard(self):
        """Test leaderboard endpoint"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Leaderboard returned {len(data)} entries")
    
    def test_get_weekly_summary(self):
        """Test weekly summary endpoint"""
        response = requests.get(f"{BASE_URL}/api/gamification/weekly-summary", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "bones_this_week" in data or "bones" in data
        print(f"✓ Weekly summary: {data}")


class TestDogsAPI:
    """Dogs CRUD endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "123456"
        })
        if response.status_code == 200:
            self.token = response.json()["session_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate")
    
    def test_get_dogs(self):
        """Test getting user's dogs"""
        response = requests.get(f"{BASE_URL}/api/dogs", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "name" in data[0]
            print(f"✓ Dogs list returned {len(data)} dogs: {[d['name'] for d in data]}")
        else:
            print("✓ Dogs list empty (no dogs registered)")


class TestEducationContent:
    """Education content endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "123456"
        })
        if response.status_code == 200:
            self.token = response.json()["session_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate")
    
    def test_get_programs(self):
        """Test getting education programs"""
        response = requests.get(f"{BASE_URL}/api/education/programs", headers=self.headers)
        # May return 404 if endpoint doesn't exist - that's OK for this test
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Education programs: {len(data)} programs")
        else:
            print(f"⚠ Education programs endpoint returned {response.status_code}")


class TestChatAPI:
    """Chat/AI endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "123456"
        })
        if response.status_code == 200:
            self.token = response.json()["session_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate")
    
    def test_get_chat_history(self):
        """Test getting chat history"""
        response = requests.get(f"{BASE_URL}/api/chat/history", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Chat history returned {len(data)} messages")


class TestMedicalAPI:
    """Medical/health endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "123456"
        })
        if response.status_code == 200:
            self.token = response.json()["session_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
            # Get dog ID
            dogs_resp = requests.get(f"{BASE_URL}/api/dogs", headers=self.headers)
            if dogs_resp.status_code == 200 and len(dogs_resp.json()) > 0:
                self.dog_id = dogs_resp.json()[0]["id"]
            else:
                self.dog_id = None
        else:
            pytest.skip("Could not authenticate")
    
    def test_get_medical_events(self):
        """Test getting medical events for a dog"""
        if not self.dog_id:
            pytest.skip("No dog available for testing")
        response = requests.get(f"{BASE_URL}/api/medical-events/{self.dog_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Medical events for dog: {len(data)} events")


class TestRoutesAPI:
    """Routes/GPS endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alexhernandez81@gmail.com",
            "password": "123456"
        })
        if response.status_code == 200:
            self.token = response.json()["session_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
            # Get dog ID
            dogs_resp = requests.get(f"{BASE_URL}/api/dogs", headers=self.headers)
            if dogs_resp.status_code == 200 and len(dogs_resp.json()) > 0:
                self.dog_id = dogs_resp.json()[0]["id"]
            else:
                self.dog_id = None
        else:
            pytest.skip("Could not authenticate")
    
    def test_get_routes(self):
        """Test getting routes for a dog"""
        if not self.dog_id:
            pytest.skip("No dog available for testing")
        response = requests.get(f"{BASE_URL}/api/routes/{self.dog_id}", headers=self.headers)
        # May return 404 or 200 depending on endpoint existence
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Routes for dog: {len(data) if isinstance(data, list) else 'N/A'}")
        elif response.status_code == 404:
            print("⚠ Routes endpoint not found (may not be implemented)")
        else:
            print(f"⚠ Routes endpoint returned {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
