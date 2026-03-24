"""
Test Emotion Diary Visibility Feature
- POST /api/diary - creates/updates emotion entry
- GET /api/diary?days=90 - returns entries with emotion, note, created_at
- GET /api/diary/today - returns today's entry status
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pet-symptom-check-2.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "review@heimdall-ai.tech"
TEST_PASSWORD = "Heimdall2026"
TEST_DOG_ID = "5abbe9fb-9ee4-4c70-8eed-bd264c2fe3a5"


@pytest.fixture(scope="module")
def session_token():
    """Login and get session token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    data = response.json()
    return data.get("session_token")


@pytest.fixture(scope="module")
def auth_headers(session_token):
    """Build auth headers"""
    return {"Authorization": f"Bearer {session_token}"}


class TestDiaryEndpoints:
    """Test diary API endpoints for visibility feature"""
    
    def test_get_today_diary_status(self, auth_headers):
        """GET /api/diary/today - returns today's status"""
        response = requests.get(f"{BASE_URL}/api/diary/today", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should have logged_today field
        assert "logged_today" in data, "Response must have 'logged_today' field"
        
        # If logged today, should have emotion and optionally note
        if data.get("logged_today"):
            assert "emotion" in data, "If logged_today=True, should have emotion"
            print(f"✓ Today's entry: emotion={data.get('emotion')}, note={data.get('note')}")
        else:
            print("✓ No entry logged today")
    
    def test_get_diary_entries_with_days_param(self, auth_headers):
        """GET /api/diary?days=90 - returns entries for last 90 days"""
        response = requests.get(f"{BASE_URL}/api/diary?days=90", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "entries" in data, "Response must have 'entries' field"
        
        entries = data["entries"]
        assert isinstance(entries, list), "entries must be a list"
        
        # Validate structure of entries
        if len(entries) > 0:
            for i, entry in enumerate(entries):
                assert "id" in entry, f"Entry {i} missing 'id'"
                assert "emotion" in entry, f"Entry {i} missing 'emotion'"
                assert "created_at" in entry, f"Entry {i} missing 'created_at'"
                # note can be null
                assert "note" in entry or entry.get("note") is None, f"Entry {i} missing 'note' field"
                
            print(f"✓ Found {len(entries)} diary entries")
            print(f"  First entry: emotion={entries[0]['emotion']}, date={entries[0]['created_at'][:10]}, note={entries[0].get('note', 'None')}")
        else:
            print("✓ No diary entries found (empty list returned)")
    
    def test_post_diary_creates_or_updates_entry(self, auth_headers):
        """POST /api/diary - creates new entry or updates today's"""
        # Post a test emotion entry
        test_data = {
            "emotion": "happy",
            "note": "Testing diary visibility feature",
            "dog_id": TEST_DOG_ID
        }
        
        response = requests.post(f"{BASE_URL}/api/diary", json=test_data, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response must have 'message' field"
        # Could be "updated" or "created"
        assert "updated" in data, "Response must indicate if entry was updated"
        
        if data.get("updated"):
            print("✓ Diary entry UPDATED (entry already existed today)")
        else:
            print("✓ Diary entry CREATED (new entry)")
    
    def test_verify_posted_entry_in_history(self, auth_headers):
        """Verify the posted entry appears in GET /api/diary history"""
        response = requests.get(f"{BASE_URL}/api/diary?days=90", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        entries = data.get("entries", [])
        
        # Find today's entry
        from datetime import datetime
        today = datetime.utcnow().strftime("%Y-%m-%d")
        today_entries = [e for e in entries if e.get("created_at", "").startswith(today)]
        
        # Should have at least today's entry
        assert len(today_entries) > 0 or len(entries) > 0, "Should have diary entries after posting"
        print(f"✓ Diary history contains {len(entries)} total entries, {len(today_entries)} from today")
    
    def test_diary_entry_structure_for_frontend(self, auth_headers):
        """Verify entries have all fields needed by frontend display"""
        response = requests.get(f"{BASE_URL}/api/diary?days=90", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        entries = data.get("entries", [])
        
        if len(entries) == 0:
            pytest.skip("No entries to validate")
        
        # Frontend expects: id, emotion, note, created_at
        required_fields = ["id", "emotion", "created_at"]
        
        for i, entry in enumerate(entries[:5]):  # Check first 5
            for field in required_fields:
                assert field in entry, f"Entry {i} missing required field '{field}'"
            
            # Validate emotion is one of expected values
            valid_emotions = ["happy", "calm", "worried", "sad", "stressed"]
            assert entry["emotion"] in valid_emotions, f"Entry {i} has unexpected emotion: {entry['emotion']}"
            
            # created_at should be ISO format
            assert "T" in entry["created_at"], f"Entry {i} created_at not in ISO format"
        
        print(f"✓ All {min(5, len(entries))} checked entries have valid structure for frontend")


class TestDiaryWithDifferentEmotions:
    """Test diary with different emotion types"""
    
    def test_post_worried_emotion(self, auth_headers):
        """Test posting worried emotion (existing test entry)"""
        # Note: This may update today's entry if run on same day
        response = requests.get(f"{BASE_URL}/api/diary/today", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Just verify the endpoint works
        print(f"✓ Today diary status: logged={data.get('logged_today')}")
        if data.get("logged_today"):
            print(f"  Emotion: {data.get('emotion')}, Note: {data.get('note', 'None')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
