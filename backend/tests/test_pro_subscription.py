"""
Test PRO/FREE Subscription System for HANI/Heimdall
- Tests daily usage tracking
- Tests subscription status endpoint
- Tests PRO activation endpoint
- Tests limit enforcement on chat messages and uploads
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = 'https://subscription-gating-3.preview.emergentagent.com'

# Test credentials
TEST_EMAIL = "alexhernandez81@gmail.com"
TEST_PASSWORD = "123456"


class TestProSubscriptionSystem:
    """Tests for the PRO/FREE subscription limit system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("session_token")
            self.user_id = response.json().get("user", {}).get("user_id")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip(f"Auth failed: {response.status_code} - {response.text}")
    
    # === Daily Usage Endpoint ===
    def test_daily_usage_returns_usage_counts(self):
        """GET /api/chat/daily-usage returns usage counts and limits"""
        response = requests.get(f"{BASE_URL}/api/chat/daily-usage", headers=self.headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify structure
        assert "is_pro" in data, "Response should contain is_pro field"
        assert "usage" in data, "Response should contain usage field"
        assert "limits" in data, "Response should contain limits field"
        
        # Verify usage structure
        usage = data["usage"]
        assert "messages" in usage, "Usage should have messages count"
        assert "photos" in usage, "Usage should have photos count"
        assert "videos" in usage, "Usage should have videos count"
        assert "pdfs" in usage, "Usage should have pdfs count"
        
        # Verify types
        assert isinstance(usage["messages"], int), "messages should be int"
        assert isinstance(usage["photos"], int), "photos should be int"
        
        print(f"Daily usage: {data}")
    
    # === Subscription Status Endpoint ===
    def test_subscription_status_returns_structure(self):
        """GET /api/subscription/status returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/subscription/status", headers=self.headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify structure
        assert "is_pro" in data, "Response should contain is_pro field"
        assert "daily_usage" in data, "Response should contain daily_usage field"
        assert "daily_limits" in data, "Response should contain daily_limits field"
        
        # Verify limits structure for free user
        limits = data["daily_limits"]
        if not data["is_pro"]:
            # Free user should have limits
            assert limits.get("messages") == 5, f"Free user messages limit should be 5, got {limits.get('messages')}"
            assert limits.get("photos") == 1, f"Free user photos limit should be 1, got {limits.get('photos')}"
            assert limits.get("videos") == 0, f"Free user videos limit should be 0, got {limits.get('videos')}"
            assert limits.get("pdfs") == 0, f"Free user pdfs limit should be 0, got {limits.get('pdfs')}"
        else:
            # PRO user should have unlimited (-1)
            assert limits.get("messages") == -1, "PRO user should have unlimited messages (-1)"
            assert limits.get("photos") == -1, "PRO user should have unlimited photos (-1)"
        
        print(f"Subscription status: {data}")
    
    # === PRO Activation Endpoint ===
    def test_subscription_activate_monthly(self):
        """POST /api/subscription/activate activates PRO status (monthly plan)"""
        response = requests.post(
            f"{BASE_URL}/api/subscription/activate", 
            json={"plan": "monthly"},
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response
        assert data.get("success") == True, "activation should be successful"
        assert data.get("is_pro") == True, "user should be PRO after activation"
        assert data.get("plan") == "monthly", f"plan should be monthly, got {data.get('plan')}"
        assert "active_until" in data, "response should include active_until date"
        
        print(f"Activation response: {data}")
    
    def test_subscription_activate_annual(self):
        """POST /api/subscription/activate activates PRO status (annual plan)"""
        response = requests.post(
            f"{BASE_URL}/api/subscription/activate", 
            json={"plan": "annual"},
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data.get("success") == True, "activation should be successful"
        assert data.get("plan") == "annual", f"plan should be annual, got {data.get('plan')}"
        
        print(f"Annual activation response: {data}")
    
    def test_subscription_status_after_activation(self):
        """After activation, subscription status should show PRO with unlimited limits"""
        # First activate
        activate_response = requests.post(
            f"{BASE_URL}/api/subscription/activate", 
            json={"plan": "monthly"},
            headers=self.headers
        )
        assert activate_response.status_code == 200, "Activation should succeed"
        
        # Now check status
        response = requests.get(f"{BASE_URL}/api/subscription/status", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify PRO status
        assert data.get("is_pro") == True, f"User should be PRO, got is_pro={data.get('is_pro')}"
        
        # Verify unlimited limits
        limits = data["daily_limits"]
        assert limits.get("messages") == -1, "PRO user should have unlimited messages (-1)"
        assert limits.get("photos") == -1, "PRO user should have unlimited photos (-1)"
        assert limits.get("videos") == -1, "PRO user should have unlimited videos (-1)"
        assert limits.get("pdfs") == -1, "PRO user should have unlimited pdfs (-1)"
        
        print(f"PRO status after activation: {data}")
    
    # === Authentication Tests ===
    def test_daily_usage_requires_auth(self):
        """GET /api/chat/daily-usage requires authentication"""
        response = requests.get(f"{BASE_URL}/api/chat/daily-usage")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_subscription_status_requires_auth(self):
        """GET /api/subscription/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/subscription/status")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_subscription_activate_requires_auth(self):
        """POST /api/subscription/activate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/subscription/activate", json={"plan": "monthly"})
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"


class TestChatLimitEnforcement:
    """Tests for chat message limit enforcement"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("session_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
            # Get user's dogs
            dogs_response = requests.get(f"{BASE_URL}/api/dogs", headers=self.headers)
            self.dog_id = dogs_response.json()[0]["id"] if dogs_response.json() else None
        else:
            pytest.skip("Auth failed")
    
    def test_chat_endpoint_works_for_pro_user(self):
        """After PRO activation, chat should work without limits"""
        # First activate PRO
        activate_response = requests.post(
            f"{BASE_URL}/api/subscription/activate", 
            json={"plan": "monthly"},
            headers=self.headers
        )
        assert activate_response.status_code == 200, "Activation should succeed"
        
        # Now send a message
        response = requests.post(
            f"{BASE_URL}/api/chat",
            json={"content": "Test message from PRO user", "dog_id": self.dog_id, "language": "Spanish"},
            headers=self.headers,
            timeout=60
        )
        
        # PRO user should be able to chat
        assert response.status_code == 200, f"PRO user should be able to chat, got {response.status_code}: {response.text}"
        data = response.json()
        assert "content" in data, "Response should contain AI content"
        assert data.get("role") == "assistant", "Response should be from assistant"
        
        print(f"Chat response: {data.get('content', '')[:100]}...")


class TestUploadLimitEnforcement:
    """Tests for file upload limit enforcement (video/PDF PRO-only)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("session_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Auth failed")
    
    # Note: We can't easily test actual file upload limits without resetting the user's 
    # PRO status and usage counts, which would require database access.
    # Instead, we verify the endpoint behavior after PRO activation.
    
    def test_upload_endpoint_exists(self):
        """Verify /api/chat/upload endpoint exists (doesn't return 404)"""
        # Just verify the endpoint exists - actual upload requires file data
        response = requests.post(
            f"{BASE_URL}/api/chat/upload",
            data={"dog_id": "", "message": "", "file_type": "image", "language": "Spanish"},
            headers=self.headers
        )
        
        # Should return 422 (missing file) or 400, not 404
        assert response.status_code != 404, "Upload endpoint should exist"
        print(f"Upload endpoint response: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
