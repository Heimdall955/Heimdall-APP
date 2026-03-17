"""
Test Medical Events API Endpoints
- POST /api/medical-events - Create medical event
- GET /api/medical-events/{dog_id} - Get events for a dog
- DELETE /api/medical-events/{event_id} - Delete event
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://pet-profile-edit.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "review@heimdall-ai.tech"
TEST_PASSWORD = "Heimdall2026"
DOG_ID = "5abbe9fb-9ee4-4c70-8eed-bd264c2fe3a5"

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    return data.get("session_token")

@pytest.fixture
def api_client(auth_token):
    """Session with auth header"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    })
    return session


class TestMedicalEventsAPI:
    """Medical Events CRUD tests"""
    
    created_event_ids = []  # Track created events for cleanup
    
    def test_get_existing_medical_events(self, api_client):
        """Test GET /api/medical-events/{dog_id} returns events list"""
        response = api_client.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
        
        assert response.status_code == 200, f"Failed: {response.text}"
        events = response.json()
        
        assert isinstance(events, list), "Response should be a list"
        print(f"Found {len(events)} existing medical events for dog")
        
        # If there are events, verify structure
        if events:
            event = events[0]
            assert "id" in event, "Event should have id"
            assert "dog_id" in event, "Event should have dog_id"
            assert "type" in event, "Event should have type"
            assert "title" in event, "Event should have title"
            assert "date" in event, "Event should have date field"
            print(f"Sample event: {event['title']} ({event['type']}) - {event['date']}")
    
    def test_create_medical_event_vaccine(self, api_client):
        """Test POST /api/medical-events creates vaccine event"""
        payload = {
            "dog_id": DOG_ID,
            "type": "vaccine",
            "title": "TEST_Vacuna de prueba",
            "description": "Test vaccine description",
            "date": "2026-01-15",
            "next_date": "2027-01-15"
        }
        
        response = api_client.post(f"{BASE_URL}/api/medical-events", json=payload)
        
        assert response.status_code == 200, f"Failed to create event: {response.text}"
        event = response.json()
        
        assert "id" in event, "Response should include event id"
        assert event["dog_id"] == DOG_ID, "Dog ID should match"
        assert event["type"] == "vaccine", "Type should be vaccine"
        assert event["title"] == "TEST_Vacuna de prueba", "Title should match"
        
        self.__class__.created_event_ids.append(event["id"])
        print(f"Created vaccine event with id: {event['id']}")
    
    def test_create_medical_event_checkup(self, api_client):
        """Test POST /api/medical-events creates checkup event"""
        payload = {
            "dog_id": DOG_ID,
            "type": "checkup",
            "title": "TEST_Revisión general",
            "description": "Annual checkup test",
            "date": "2026-01-10"
        }
        
        response = api_client.post(f"{BASE_URL}/api/medical-events", json=payload)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        event = response.json()
        
        assert event["type"] == "checkup", "Type should be checkup"
        self.__class__.created_event_ids.append(event["id"])
        print(f"Created checkup event with id: {event['id']}")
    
    def test_create_medical_event_deworming(self, api_client):
        """Test POST /api/medical-events creates deworming event"""
        payload = {
            "dog_id": DOG_ID,
            "type": "deworming",
            "title": "TEST_Desparasitación",
            "date": "2026-01-05"
        }
        
        response = api_client.post(f"{BASE_URL}/api/medical-events", json=payload)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        event = response.json()
        
        assert event["type"] == "deworming", "Type should be deworming"
        self.__class__.created_event_ids.append(event["id"])
        print(f"Created deworming event with id: {event['id']}")
    
    def test_create_medical_event_note(self, api_client):
        """Test POST /api/medical-events creates note event"""
        payload = {
            "dog_id": DOG_ID,
            "type": "note",
            "title": "TEST_Nota médica",
            "description": "Just a medical note for testing",
            "date": "2026-01-01"
        }
        
        response = api_client.post(f"{BASE_URL}/api/medical-events", json=payload)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        event = response.json()
        
        assert event["type"] == "note", "Type should be note"
        self.__class__.created_event_ids.append(event["id"])
        print(f"Created note event with id: {event['id']}")
    
    def test_verify_created_events_in_list(self, api_client):
        """Verify created events appear in GET list"""
        response = api_client.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
        
        assert response.status_code == 200
        events = response.json()
        
        event_ids = [e["id"] for e in events]
        for created_id in self.__class__.created_event_ids:
            assert created_id in event_ids, f"Created event {created_id} should be in list"
        
        print(f"All {len(self.__class__.created_event_ids)} created events found in list")
    
    def test_events_sorted_by_date_desc(self, api_client):
        """Verify events are sorted by date descending"""
        response = api_client.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
        
        assert response.status_code == 200
        events = response.json()
        
        if len(events) > 1:
            for i in range(len(events) - 1):
                date1 = events[i].get("date", "")
                date2 = events[i + 1].get("date", "")
                assert date1 >= date2, f"Events not sorted: {date1} should be >= {date2}"
            print("Events are sorted by date descending")
    
    def test_event_structure_for_frontend(self, api_client):
        """Verify event structure matches frontend expectations"""
        response = api_client.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
        
        assert response.status_code == 200
        events = response.json()
        
        if events:
            event = events[0]
            # Frontend expects these fields
            required_fields = ["id", "dog_id", "type", "title", "date"]
            for field in required_fields:
                assert field in event, f"Missing required field: {field}"
            
            # Optional fields
            optional_fields = ["description", "next_date", "created_at"]
            for field in optional_fields:
                if field in event:
                    print(f"Optional field '{field}' present: {event.get(field)}")
            
            print(f"Event structure valid. Type: {event['type']}, Title: {event['title']}")
    
    def test_delete_medical_event(self, api_client):
        """Test DELETE /api/medical-events/{event_id} removes event"""
        if not self.__class__.created_event_ids:
            pytest.skip("No events to delete")
        
        event_id = self.__class__.created_event_ids.pop()
        response = api_client.delete(f"{BASE_URL}/api/medical-events/{event_id}")
        
        assert response.status_code == 200, f"Failed to delete: {response.text}"
        data = response.json()
        assert "message" in data or response.status_code == 200
        
        print(f"Deleted event {event_id}")
        
        # Verify deletion
        response = api_client.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
        events = response.json()
        event_ids = [e["id"] for e in events]
        assert event_id not in event_ids, "Deleted event should not appear in list"
        print(f"Verified event {event_id} no longer in list")
    
    def test_cleanup_test_events(self, api_client):
        """Cleanup: Delete all TEST_ prefixed events"""
        response = api_client.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
        events = response.json()
        
        deleted = 0
        for event in events:
            if event.get("title", "").startswith("TEST_"):
                api_client.delete(f"{BASE_URL}/api/medical-events/{event['id']}")
                deleted += 1
        
        # Also clean up tracked events
        for event_id in self.__class__.created_event_ids:
            try:
                api_client.delete(f"{BASE_URL}/api/medical-events/{event_id}")
                deleted += 1
            except:
                pass
        
        self.__class__.created_event_ids.clear()
        print(f"Cleanup: Deleted {deleted} test events")


class TestMedicalEventsDateFormats:
    """Test that date formats work correctly"""
    
    def test_date_format_yyyy_mm_dd(self, api_client):
        """Test date in YYYY-MM-DD format works"""
        payload = {
            "dog_id": DOG_ID,
            "type": "vaccine",
            "title": "TEST_Date format test",
            "date": "2026-02-15"
        }
        
        response = api_client.post(f"{BASE_URL}/api/medical-events", json=payload)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        event = response.json()
        event_id = event["id"]
        
        # Verify in GET response
        response = api_client.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
        events = response.json()
        
        found = next((e for e in events if e["id"] == event_id), None)
        assert found is not None, "Event not found"
        assert "2026-02-15" in found["date"], f"Date should contain 2026-02-15, got: {found['date']}"
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/medical-events/{event_id}")
        print(f"Date format YYYY-MM-DD works correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
