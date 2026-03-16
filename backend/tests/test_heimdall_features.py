"""
Backend API tests for Heimdall Dog Training App - New Features
Tests: Login, Weekly Summary, Diary, Subscription Status, Lessons Progress
"""
import pytest
import requests
import os

# Use the public URL for testing
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://hani-learning.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "testlesson@test.com"
TEST_PASSWORD = "test123456"


class TestAuth:
    """Test authentication endpoints"""
    
    session_token = None
    
    def test_login_returns_session_token(self):
        """Test POST /api/auth/login returns session_token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "session_token" in data, f"Expected session_token in response, got: {data}"
        assert isinstance(data["session_token"], str), "session_token should be a string"
        assert len(data["session_token"]) > 0, "session_token should not be empty"
        
        # Also verify user object
        assert "user" in data, "Expected user in response"
        assert "user_id" in data["user"], "Expected user_id in user"
        assert "email" in data["user"], "Expected email in user"
        
        # Store for other tests
        TestAuth.session_token = data["session_token"]
        print(f"Login successful, got session_token: {data['session_token'][:20]}...")


@pytest.fixture
def auth_headers():
    """Get authenticated headers using session_token"""
    if not TestAuth.session_token:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            TestAuth.session_token = response.json()["session_token"]
        else:
            pytest.skip("Could not authenticate - skipping test")
    
    return {"Authorization": f"Bearer {TestAuth.session_token}", "Content-Type": "application/json"}


class TestGamificationWeeklySummary:
    """Test gamification weekly summary endpoint"""
    
    def test_weekly_summary_returns_required_fields(self, auth_headers):
        """Test GET /api/gamification/weekly-summary returns bones_this_week, exercises_this_week, week_start"""
        response = requests.get(
            f"{BASE_URL}/api/gamification/weekly-summary",
            headers=auth_headers
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions - check required fields
        data = response.json()
        
        # Required fields per the test specification
        assert "bones_this_week" in data, f"Expected bones_this_week in response, got: {data.keys()}"
        assert "exercises_this_week" in data, f"Expected exercises_this_week in response, got: {data.keys()}"
        assert "week_start" in data, f"Expected week_start in response, got: {data.keys()}"
        
        # Type assertions
        assert isinstance(data["bones_this_week"], int), f"bones_this_week should be int, got {type(data['bones_this_week'])}"
        assert isinstance(data["exercises_this_week"], int), f"exercises_this_week should be int, got {type(data['exercises_this_week'])}"
        assert isinstance(data["week_start"], str), f"week_start should be string, got {type(data['week_start'])}"
        
        print(f"Weekly summary: bones={data['bones_this_week']}, exercises={data['exercises_this_week']}, week_start={data['week_start']}")


class TestDiary:
    """Test emotion diary endpoints"""
    
    def test_diary_create_returns_message(self, auth_headers):
        """Test POST /api/diary creates emotion diary entry and returns message"""
        response = requests.post(
            f"{BASE_URL}/api/diary",
            headers=auth_headers,
            json={"emotion": "happy", "note": "Test entry from pytest"}
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "message" in data, f"Expected message in response, got: {data}"
        assert isinstance(data["message"], str), "message should be a string"
        
        print(f"Diary entry created: {data['message']}")
    
    def test_diary_today_returns_logged_today(self, auth_headers):
        """Test GET /api/diary/today returns logged_today field"""
        response = requests.get(
            f"{BASE_URL}/api/diary/today",
            headers=auth_headers
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "logged_today" in data, f"Expected logged_today in response, got: {data.keys()}"
        assert isinstance(data["logged_today"], bool), f"logged_today should be bool, got {type(data['logged_today'])}"
        
        print(f"Diary today status: logged_today={data['logged_today']}")


class TestSubscriptionStatus:
    """Test subscription status endpoint"""
    
    def test_subscription_status_returns_required_fields(self, auth_headers):
        """Test GET /api/subscription/status returns is_pro, plan, daily_limits"""
        response = requests.get(
            f"{BASE_URL}/api/subscription/status",
            headers=auth_headers
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        
        # Required fields
        assert "is_pro" in data, f"Expected is_pro in response, got: {data.keys()}"
        assert "plan" in data, f"Expected plan in response, got: {data.keys()}"
        assert "daily_limits" in data, f"Expected daily_limits in response, got: {data.keys()}"
        
        # Type assertions
        assert isinstance(data["is_pro"], bool), f"is_pro should be bool, got {type(data['is_pro'])}"
        # plan can be None for free users
        if data["is_pro"]:
            assert isinstance(data["plan"], str), f"plan should be string for PRO users"
        
        assert isinstance(data["daily_limits"], dict), f"daily_limits should be dict, got {type(data['daily_limits'])}"
        
        print(f"Subscription status: is_pro={data['is_pro']}, plan={data.get('plan')}, limits={data['daily_limits']}")


class TestLessonsProgress:
    """Test lessons progress endpoint"""
    
    def test_lessons_progress_returns_completed_lessons(self, auth_headers):
        """Test GET /api/lessons/progress returns completed_lessons array"""
        response = requests.get(
            f"{BASE_URL}/api/lessons/progress",
            headers=auth_headers
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        
        assert "completed_lessons" in data, f"Expected completed_lessons in response, got: {data.keys()}"
        assert isinstance(data["completed_lessons"], list), f"completed_lessons should be list, got {type(data['completed_lessons'])}"
        
        # If there are completed lessons, verify structure
        if len(data["completed_lessons"]) > 0:
            lesson = data["completed_lessons"][0]
            assert "lesson_id" in lesson, f"Expected lesson_id in lesson item, got: {lesson.keys()}"
        
        print(f"Lessons progress: {len(data['completed_lessons'])} completed lessons")


class TestHealthEndpoint:
    """Test health endpoint (no auth required)"""
    
    def test_health_endpoint(self):
        """Test GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy", f"Expected status=healthy, got: {data}"
        
        print(f"Health check passed: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
