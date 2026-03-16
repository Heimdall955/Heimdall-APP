"""
Test cases for Lesson Progress API endpoints
- POST /api/lessons/progress - saves a lesson completion with lesson_id
- POST /api/lessons/progress - duplicate protection (returns already_completed:true)
- GET /api/lessons/progress - returns list of completed lessons
- Auth required on both endpoints (returns 401 without token)
- Backend correctly handles lesson_progress Supabase table (no program_id column)
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

# Use external URL from environment
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://hani-learning.preview.emergentagent.com"

# Test credentials from main agent context
TEST_EMAIL = "testlesson@test.com"
TEST_PASSWORD = "test123456"


class TestLessonProgressAuth:
    """Test authentication requirements for lesson progress endpoints"""
    
    def test_post_lesson_progress_without_auth_returns_401(self):
        """POST /api/lessons/progress should return 401 without auth token"""
        response = requests.post(
            f"{BASE_URL}/api/lessons/progress",
            json={"lesson_id": "test-lesson-1"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("PASS: POST /api/lessons/progress returns 401 without auth")
    
    def test_get_lesson_progress_without_auth_returns_401(self):
        """GET /api/lessons/progress should return 401 without auth token"""
        response = requests.get(
            f"{BASE_URL}/api/lessons/progress",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("PASS: GET /api/lessons/progress returns 401 without auth")


class TestLessonProgressCRUD:
    """Test CRUD operations for lesson progress"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Login and get auth token before tests"""
        # First try to login with the test user
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 401:
            # User doesn't exist, try to register
            register_response = requests.post(
                f"{BASE_URL}/api/auth/register",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD,
                    "name": "Test Lesson User"
                },
                headers={"Content-Type": "application/json"}
            )
            if register_response.status_code in [200, 201]:
                data = register_response.json()
                self.session_token = data.get("session_token")
            else:
                # If registration also fails, try login again (might be 429)
                pytest.skip(f"Could not authenticate: {register_response.status_code}")
        elif login_response.status_code == 200:
            data = login_response.json()
            self.session_token = data.get("session_token")
        else:
            pytest.skip(f"Login failed with status {login_response.status_code}: {login_response.text}")
        
        if not self.session_token:
            pytest.skip("Could not obtain session token")
        
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.session_token}"
        }
        
        # Generate unique lesson ID for this test run
        self.unique_lesson_id = f"TEST_lesson_{uuid.uuid4().hex[:8]}"
    
    def test_save_lesson_progress_success(self):
        """POST /api/lessons/progress should save a lesson completion"""
        response = requests.post(
            f"{BASE_URL}/api/lessons/progress",
            json={"lesson_id": self.unique_lesson_id},
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, f"Response should contain 'message': {data}"
        assert "lesson_id" in data, f"Response should contain 'lesson_id': {data}"
        assert data["lesson_id"] == self.unique_lesson_id, f"lesson_id mismatch: {data}"
        assert data.get("already_completed") == False, f"First save should not be already_completed: {data}"
        
        print(f"PASS: POST /api/lessons/progress saved lesson '{self.unique_lesson_id}'")
        print(f"Response: {data}")
    
    def test_save_lesson_progress_duplicate_protection(self):
        """POST /api/lessons/progress twice should return already_completed:true"""
        # First save
        response1 = requests.post(
            f"{BASE_URL}/api/lessons/progress",
            json={"lesson_id": self.unique_lesson_id},
            headers=self.headers
        )
        assert response1.status_code == 200, f"First save failed: {response1.status_code}: {response1.text}"
        
        # Second save with same lesson_id
        response2 = requests.post(
            f"{BASE_URL}/api/lessons/progress",
            json={"lesson_id": self.unique_lesson_id},
            headers=self.headers
        )
        assert response2.status_code == 200, f"Duplicate save failed: {response2.status_code}: {response2.text}"
        
        data = response2.json()
        assert data.get("already_completed") == True, f"Duplicate should be already_completed: {data}"
        
        print(f"PASS: Duplicate lesson save returns already_completed:true")
        print(f"Response: {data}")
    
    def test_get_lesson_progress_returns_list(self):
        """GET /api/lessons/progress should return list of completed lessons"""
        # First save a lesson to ensure we have data
        save_response = requests.post(
            f"{BASE_URL}/api/lessons/progress",
            json={"lesson_id": self.unique_lesson_id},
            headers=self.headers
        )
        assert save_response.status_code == 200, f"Save failed: {save_response.status_code}"
        
        # Then get the progress
        response = requests.get(
            f"{BASE_URL}/api/lessons/progress",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "completed_lessons" in data, f"Response should contain 'completed_lessons': {data}"
        assert isinstance(data["completed_lessons"], list), f"completed_lessons should be a list: {data}"
        
        # Check that our saved lesson is in the list
        lesson_ids = [l.get("lesson_id") for l in data["completed_lessons"]]
        assert self.unique_lesson_id in lesson_ids, f"Saved lesson not found in progress list: {lesson_ids}"
        
        # Check structure of items
        if data["completed_lessons"]:
            first_item = data["completed_lessons"][0]
            assert "lesson_id" in first_item, f"Item should have lesson_id: {first_item}"
            assert "completed_at" in first_item, f"Item should have completed_at: {first_item}"
        
        print(f"PASS: GET /api/lessons/progress returns list with {len(data['completed_lessons'])} items")
        print(f"Found lesson '{self.unique_lesson_id}' in progress list")
    
    def test_save_lesson_progress_with_optional_program_id(self):
        """POST /api/lessons/progress should work with optional program_id (even though not stored)"""
        new_lesson_id = f"TEST_lesson_prog_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/lessons/progress",
            json={
                "lesson_id": new_lesson_id,
                "program_id": "obediencia-basica"  # Optional field
            },
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("already_completed") == False, f"Should be new lesson: {data}"
        assert data.get("lesson_id") == new_lesson_id, f"lesson_id mismatch: {data}"
        
        print(f"PASS: POST /api/lessons/progress works with optional program_id")
        print(f"Response: {data}")


class TestLessonProgressValidation:
    """Test input validation for lesson progress"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Login and get auth token before tests"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 401:
            register_response = requests.post(
                f"{BASE_URL}/api/auth/register",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD,
                    "name": "Test Lesson User"
                },
                headers={"Content-Type": "application/json"}
            )
            if register_response.status_code in [200, 201]:
                self.session_token = register_response.json().get("session_token")
            else:
                pytest.skip(f"Could not authenticate")
        elif login_response.status_code == 200:
            self.session_token = login_response.json().get("session_token")
        else:
            pytest.skip(f"Login failed")
        
        if not self.session_token:
            pytest.skip("Could not obtain session token")
        
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.session_token}"
        }
    
    def test_save_lesson_progress_missing_lesson_id(self):
        """POST /api/lessons/progress without lesson_id should fail"""
        response = requests.post(
            f"{BASE_URL}/api/lessons/progress",
            json={},  # No lesson_id
            headers=self.headers
        )
        
        # Pydantic validation should return 422
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
        print("PASS: POST /api/lessons/progress without lesson_id returns 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
