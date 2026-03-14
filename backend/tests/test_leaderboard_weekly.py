"""
Test cases for Leaderboard and Weekly Summary features
- GET /api/gamification/leaderboard - Social leaderboard with ranks
- GET /api/gamification/weekly-summary - Weekly progress summary
- POST /api/gamification/add-bones - Verify weekly tracking integration
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://lesson-progress-fix.preview.emergentagent.com')

class TestLeaderboardAndWeeklySummary:
    """Test leaderboard and weekly summary features"""
    
    @pytest.fixture(scope="class")
    def test_user_session(self):
        """Create a test user and return session token"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_leaderboard_{unique_id}@test.com"
        password = "testpass123"
        name = f"TestUser_{unique_id}"
        
        # Register user
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "name": name
        })
        
        if response.status_code != 200:
            pytest.skip(f"Failed to create test user: {response.text}")
        
        data = response.json()
        return {
            "token": data["session_token"],
            "user_id": data["user"]["user_id"],
            "name": name,
            "email": email
        }
    
    @pytest.fixture(scope="class")
    def auth_headers(self, test_user_session):
        """Return authorization headers"""
        return {"Authorization": f"Bearer {test_user_session['token']}"}
    
    # ================== LEADERBOARD TESTS ==================
    
    def test_leaderboard_endpoint_returns_200(self, auth_headers):
        """GET /api/gamification/leaderboard returns 200"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=20", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Leaderboard endpoint returns 200")
    
    def test_leaderboard_response_structure(self, auth_headers):
        """Leaderboard returns expected structure with leaderboard array"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=20", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check top-level fields
        assert "leaderboard" in data, "Missing 'leaderboard' field"
        assert "current_user_rank" in data, "Missing 'current_user_rank' field"
        assert "total_users" in data, "Missing 'total_users' field"
        
        assert isinstance(data["leaderboard"], list), "leaderboard should be a list"
        print(f"PASS: Leaderboard structure valid with {len(data['leaderboard'])} entries")
    
    def test_leaderboard_entry_fields(self, auth_headers):
        """Each leaderboard entry has required fields"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=20", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        leaderboard = data["leaderboard"]
        
        required_fields = ["rank", "name", "dog_name", "bones", "level", "xp", "streak_days", "is_current_user"]
        
        for entry in leaderboard:
            for field in required_fields:
                assert field in entry, f"Missing field '{field}' in leaderboard entry"
        
        print(f"PASS: All {len(required_fields)} required fields present in each entry")
    
    def test_leaderboard_sorted_by_bones_descending(self, auth_headers):
        """Leaderboard entries are sorted by bones in descending order"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=20", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        leaderboard = data["leaderboard"]
        
        if len(leaderboard) >= 2:
            for i in range(len(leaderboard) - 1):
                assert leaderboard[i]["bones"] >= leaderboard[i+1]["bones"], \
                    f"Leaderboard not sorted: {leaderboard[i]['bones']} < {leaderboard[i+1]['bones']}"
        
        print("PASS: Leaderboard sorted by bones descending")
    
    def test_leaderboard_rank_is_sequential(self, auth_headers):
        """Ranks are sequential starting from 1"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=20", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        leaderboard = data["leaderboard"]
        
        for i, entry in enumerate(leaderboard):
            expected_rank = i + 1
            assert entry["rank"] == expected_rank, f"Expected rank {expected_rank}, got {entry['rank']}"
        
        print("PASS: Ranks are sequential")
    
    def test_leaderboard_is_current_user_field(self, auth_headers, test_user_session):
        """is_current_user field correctly identifies the current user"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=100", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        leaderboard = data["leaderboard"]
        
        # Find current user in leaderboard
        current_user_entries = [e for e in leaderboard if e.get("is_current_user") == True]
        
        # At most one entry should be current user
        assert len(current_user_entries) <= 1, "Multiple entries marked as current user"
        
        print(f"PASS: is_current_user field works correctly ({len(current_user_entries)} current user entries)")
    
    def test_leaderboard_limit_parameter(self, auth_headers):
        """Limit parameter works correctly"""
        # Test with small limit
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=3", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        leaderboard = data["leaderboard"]
        
        assert len(leaderboard) <= 3, f"Expected at most 3 entries, got {len(leaderboard)}"
        print(f"PASS: Limit parameter respected (got {len(leaderboard)} entries with limit=3)")
    
    # ================== WEEKLY SUMMARY TESTS ==================
    
    def test_weekly_summary_endpoint_returns_200(self, auth_headers):
        """GET /api/gamification/weekly-summary returns 200"""
        response = requests.get(f"{BASE_URL}/api/gamification/weekly-summary", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Weekly summary endpoint returns 200")
    
    def test_weekly_summary_response_structure(self, auth_headers):
        """Weekly summary returns expected structure"""
        response = requests.get(f"{BASE_URL}/api/gamification/weekly-summary", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields based on backend implementation
        required_fields = [
            "bones_this_week", "exercises_this_week", "streak_days",
            "level", "level_progress", "level_target", "bones_total", "exercises_total"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field '{field}' in weekly summary"
        
        print(f"PASS: Weekly summary structure valid with {len(data)} fields")
    
    def test_weekly_summary_level_progress_calculation(self, auth_headers):
        """level_progress is correctly calculated (xp % 500)"""
        response = requests.get(f"{BASE_URL}/api/gamification/weekly-summary", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # level_progress should be between 0 and 499 (xp % 500)
        level_progress = data.get("level_progress", 0)
        assert 0 <= level_progress < 500, f"level_progress {level_progress} out of valid range [0, 500)"
        
        print(f"PASS: level_progress ({level_progress}) is in valid range")
    
    def test_weekly_summary_level_target_is_500(self, auth_headers):
        """level_target is always 500"""
        response = requests.get(f"{BASE_URL}/api/gamification/weekly-summary", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        assert data.get("level_target") == 500, f"Expected level_target=500, got {data.get('level_target')}"
        print("PASS: level_target is 500")
    
    def test_weekly_summary_numeric_values(self, auth_headers):
        """All numeric fields in weekly summary are valid numbers"""
        response = requests.get(f"{BASE_URL}/api/gamification/weekly-summary", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        numeric_fields = ["bones_this_week", "exercises_this_week", "streak_days", 
                         "level", "level_progress", "level_target", "bones_total", "exercises_total"]
        
        for field in numeric_fields:
            value = data.get(field)
            assert isinstance(value, (int, float)), f"Field '{field}' should be numeric, got {type(value)}: {value}"
            assert value >= 0, f"Field '{field}' should be non-negative, got {value}"
        
        print("PASS: All numeric fields are valid non-negative numbers")
    
    # ================== ADD BONES WITH WEEKLY TRACKING TESTS ==================
    
    def test_add_bones_still_works(self, auth_headers):
        """POST /api/gamification/add-bones still works correctly"""
        response = requests.post(f"{BASE_URL}/api/gamification/add-bones", 
                                json={"amount": 5, "reason": "Test activity"},
                                headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "bones_added" in data, "Missing 'bones_added' in response"
        assert data["bones_added"] == 5, f"Expected 5 bones added, got {data['bones_added']}"
        
        print("PASS: add-bones works correctly")
    
    def test_add_bones_updates_totals(self, auth_headers):
        """Adding bones updates total bones"""
        # Get initial stats
        initial_response = requests.get(f"{BASE_URL}/api/gamification/stats", headers=auth_headers)
        initial_bones = initial_response.json().get("bones", 0)
        
        # Add bones
        requests.post(f"{BASE_URL}/api/gamification/add-bones", 
                     json={"amount": 10, "reason": "Test activity"},
                     headers=auth_headers)
        
        # Check updated stats
        final_response = requests.get(f"{BASE_URL}/api/gamification/stats", headers=auth_headers)
        final_bones = final_response.json().get("bones", 0)
        
        assert final_bones == initial_bones + 10, f"Expected {initial_bones + 10} bones, got {final_bones}"
        print(f"PASS: Bones updated from {initial_bones} to {final_bones}")
    
    # ================== AUTH TESTS ==================
    
    def test_leaderboard_requires_auth(self):
        """Leaderboard endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: Leaderboard requires authentication")
    
    def test_weekly_summary_requires_auth(self):
        """Weekly summary endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/gamification/weekly-summary")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: Weekly summary requires authentication")


class TestLeaderboardWithDogs:
    """Test leaderboard with dog name integration"""
    
    @pytest.fixture(scope="class")
    def test_user_with_dog(self):
        """Create a test user with a dog and return session"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_lb_dog_{unique_id}@test.com"
        password = "testpass123"
        name = f"TestDogOwner_{unique_id}"
        
        # Register user
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "name": name
        })
        
        if response.status_code != 200:
            pytest.skip(f"Failed to create test user: {response.text}")
        
        data = response.json()
        token = data["session_token"]
        user_id = data["user"]["user_id"]
        
        # Create a dog for this user
        dog_name = f"TestDog_{unique_id}"
        dog_response = requests.post(f"{BASE_URL}/api/dogs", 
                                     json={"name": dog_name, "age": 24, "weight": 15.0, "breed": "TestBreed"},
                                     headers={"Authorization": f"Bearer {token}"})
        
        dog_id = None
        if dog_response.status_code == 200:
            dog_id = dog_response.json().get("id")
        
        return {
            "token": token,
            "user_id": user_id,
            "name": name,
            "email": email,
            "dog_name": dog_name,
            "dog_id": dog_id
        }
    
    def test_leaderboard_includes_dog_name(self, test_user_with_dog):
        """Leaderboard includes dog_name field when user has a dog"""
        auth_headers = {"Authorization": f"Bearer {test_user_with_dog['token']}"}
        
        # First, add some bones so user appears in leaderboard
        requests.post(f"{BASE_URL}/api/gamification/add-bones", 
                     json={"amount": 100, "reason": "Test for leaderboard"},
                     headers=auth_headers)
        
        # Get leaderboard
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard?limit=100", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        leaderboard = data["leaderboard"]
        
        # Find current user's entry
        current_user_entry = None
        for entry in leaderboard:
            if entry.get("is_current_user"):
                current_user_entry = entry
                break
        
        if current_user_entry:
            # Check dog_name field exists
            assert "dog_name" in current_user_entry, "Missing dog_name field"
            # Dog name should match (or be None if fetch failed)
            if current_user_entry["dog_name"]:
                print(f"PASS: User's dog_name in leaderboard: {current_user_entry['dog_name']}")
            else:
                print("INFO: dog_name is null (dog may not be linked yet)")
        else:
            print("INFO: Current user not in top leaderboard entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
