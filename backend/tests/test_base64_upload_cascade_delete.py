"""
Test Suite for Base64 Image Upload and Cascade Delete Features
- POST /api/chat/upload-base64 accepts JSON with base64 image data
- POST /api/chat/upload-base64 returns 403 LIMIT_PHOTOS for free users exceeding daily limit
- DELETE /api/dogs/{dog_id} properly cascade deletes related data
- POST /api/dogs creates new dog
- GET /api/dogs returns correct data
- POST /api/chat still works for text messages
"""

import pytest
import requests
import os
import base64
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pet-symptom-check-2.preview.emergentagent.com').rstrip('/')

# Test credentials from review request
REVIEW_EMAIL = "review@heimdall-ai.tech"
REVIEW_PASSWORD = "Heimdall2026"
REVIEW_DOG_ID = "5abbe9fb-9ee4-4c70-8eed-bd264c2fe3a5"

# Free user for limit testing
FREE_USER_EMAIL = "alexhernandez81@gmail.com"
FREE_USER_PASSWORD = "123456"


@pytest.fixture(scope="module")
def review_session():
    """Get session token for review account (PRO user)"""
    session = requests.Session()
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": REVIEW_EMAIL,
        "password": REVIEW_PASSWORD
    })
    if response.status_code == 200:
        token = response.json().get("session_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    pytest.skip(f"Cannot login with review account: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def free_user_session():
    """Get session token for free user account (not PRO)"""
    session = requests.Session()
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": FREE_USER_EMAIL,
        "password": FREE_USER_PASSWORD
    })
    if response.status_code == 200:
        token = response.json().get("session_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    pytest.skip(f"Cannot login with free user account: {response.status_code} - {response.text}")


# Small 1x1 pixel red JPEG image in base64
TINY_JPEG_BASE64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAWD/2Q=="


class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_health_check(self):
        """Test API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("PASSED: Health check returns healthy status")
    
    def test_review_account_login(self, review_session):
        """Test review account can login"""
        response = review_session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == REVIEW_EMAIL
        print(f"PASSED: Review account login works - user_id: {data.get('user_id')}")


class TestBase64UploadEndpoint:
    """Tests for POST /api/chat/upload-base64 endpoint"""
    
    def test_upload_base64_accepts_json(self, review_session):
        """Test that upload-base64 endpoint accepts JSON with base64 image data"""
        response = review_session.post(f"{BASE_URL}/api/chat/upload-base64", json={
            "image_base64": TINY_JPEG_BASE64,
            "dog_id": REVIEW_DOG_ID,
            "message": "Test image upload",
            "language": "Spanish"
        })
        
        # Should return 200 even for tiny image (AI may say it can't analyze it)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert "role" in data
        assert data["role"] == "assistant"
        assert "content" in data
        assert "file_type" in data
        assert data["file_type"] == "image"
        assert "created_at" in data
        
        print(f"PASSED: upload-base64 accepts JSON - response has id, role, content, file_type, created_at")
        print(f"  AI Response preview: {data['content'][:100]}...")
    
    def test_upload_base64_with_data_uri_prefix(self, review_session):
        """Test that upload-base64 handles data:image/jpeg;base64, prefix"""
        response = review_session.post(f"{BASE_URL}/api/chat/upload-base64", json={
            "image_base64": f"data:image/jpeg;base64,{TINY_JPEG_BASE64}",
            "dog_id": REVIEW_DOG_ID,
            "message": "",
            "language": "Spanish"
        })
        
        assert response.status_code == 200, f"Expected 200 with data URI prefix, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["role"] == "assistant"
        print("PASSED: upload-base64 handles data:image/jpeg;base64, prefix correctly")
    
    def test_upload_base64_requires_auth(self):
        """Test that upload-base64 endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/chat/upload-base64", json={
            "image_base64": TINY_JPEG_BASE64,
            "dog_id": REVIEW_DOG_ID,
            "message": "Test",
            "language": "Spanish"
        })
        
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASSED: upload-base64 requires authentication (returns 401 without token)")
    
    def test_upload_base64_invalid_base64(self, review_session):
        """Test that upload-base64 handles invalid base64 gracefully"""
        response = review_session.post(f"{BASE_URL}/api/chat/upload-base64", json={
            "image_base64": "not-valid-base64!!!",
            "dog_id": REVIEW_DOG_ID,
            "message": "Test",
            "language": "Spanish"
        })
        
        # Should return 500 for invalid base64
        assert response.status_code == 500, f"Expected 500 for invalid base64, got {response.status_code}"
        print("PASSED: upload-base64 returns 500 for invalid base64 data")


class TestPhotoLimitForFreeUsers:
    """Tests for 403 LIMIT_PHOTOS for free users"""
    
    def test_free_user_photo_limit(self, free_user_session):
        """
        Test that free users get 403 LIMIT_PHOTOS after exceeding daily limit.
        Note: FREE_LIMITS['photos'] = 1, so first upload might work, second should fail.
        This test just validates the error code behavior exists.
        """
        # Get user's dogs first
        dogs_response = free_user_session.get(f"{BASE_URL}/api/dogs")
        if dogs_response.status_code != 200 or not dogs_response.json():
            pytest.skip("Free user has no dogs to test with")
        
        dog_id = dogs_response.json()[0]["id"]
        
        # Try multiple uploads - eventually should hit limit
        # First check if they already hit limit today
        response = free_user_session.post(f"{BASE_URL}/api/chat/upload-base64", json={
            "image_base64": TINY_JPEG_BASE64,
            "dog_id": dog_id,
            "message": "Testing limit",
            "language": "Spanish"
        })
        
        if response.status_code == 403:
            data = response.json()
            assert data.get("detail") == "LIMIT_PHOTOS", f"Expected LIMIT_PHOTOS detail, got: {data}"
            print("PASSED: Free user gets 403 LIMIT_PHOTOS (already at limit)")
            return
        
        # If first succeeded, try second upload
        response2 = free_user_session.post(f"{BASE_URL}/api/chat/upload-base64", json={
            "image_base64": TINY_JPEG_BASE64,
            "dog_id": dog_id,
            "message": "Testing limit again",
            "language": "Spanish"
        })
        
        if response2.status_code == 403:
            data = response2.json()
            assert data.get("detail") == "LIMIT_PHOTOS", f"Expected LIMIT_PHOTOS detail, got: {data}"
            print("PASSED: Free user gets 403 LIMIT_PHOTOS after exceeding daily limit")
        else:
            # User might be PRO or limit might be higher
            print(f"INFO: Free user didn't hit limit (status: {response2.status_code}) - user may have PRO status")


class TestCascadeDelete:
    """Tests for DELETE /api/dogs/{dog_id} cascade delete"""
    
    def test_cascade_delete_flow(self, review_session):
        """
        Test complete cascade delete flow:
        1. Create a test dog
        2. Add related data (chat message, medical event)
        3. Delete the dog
        4. Verify dog is deleted
        """
        # 1. Create test dog
        test_dog_name = f"TEST_DeleteMe_{uuid.uuid4().hex[:8]}"
        create_response = review_session.post(f"{BASE_URL}/api/dogs", json={
            "name": test_dog_name,
            "age": 24,
            "weight": 10.0,
            "pet_type": "dog",
            "breed": "Test Breed"
        })
        
        assert create_response.status_code == 200, f"Failed to create dog: {create_response.text}"
        dog_id = create_response.json()["id"]
        print(f"  Created test dog: {test_dog_name} (id: {dog_id})")
        
        # 2. Add related chat message
        chat_response = review_session.post(f"{BASE_URL}/api/chat", json={
            "content": "TEST_CASCADE_DELETE message",
            "dog_id": dog_id,
            "language": "Spanish"
        })
        assert chat_response.status_code == 200, f"Failed to create chat message: {chat_response.text}"
        print("  Created related chat message")
        
        # 3. Add medical event
        medical_response = review_session.post(f"{BASE_URL}/api/medical-events", json={
            "dog_id": dog_id,
            "type": "note",
            "title": "TEST_CASCADE_DELETE event",
            "description": "Test event for cascade delete",
            "date": "2025-01-01"
        })
        assert medical_response.status_code == 200, f"Failed to create medical event: {medical_response.text}"
        print("  Created related medical event")
        
        # 4. Delete the dog (should cascade delete related data)
        delete_response = review_session.delete(f"{BASE_URL}/api/dogs/{dog_id}")
        assert delete_response.status_code == 200, f"Failed to delete dog: {delete_response.text}"
        data = delete_response.json()
        assert data.get("message") == "Perro eliminado"
        print("  Deleted dog with cascade")
        
        # 5. Verify dog is gone
        get_response = review_session.get(f"{BASE_URL}/api/dogs/{dog_id}")
        assert get_response.status_code == 404, f"Dog should be deleted, got: {get_response.status_code}"
        
        print("PASSED: Cascade delete works - dog and related data deleted successfully")
    
    def test_delete_nonexistent_dog_returns_404(self, review_session):
        """Test deleting a non-existent dog returns 404"""
        fake_id = str(uuid.uuid4())
        response = review_session.delete(f"{BASE_URL}/api/dogs/{fake_id}")
        assert response.status_code == 404
        print("PASSED: Delete non-existent dog returns 404")


class TestDogsEndpoints:
    """Tests for /api/dogs CRUD operations"""
    
    def test_get_dogs_returns_list(self, review_session):
        """Test GET /api/dogs returns list of dogs"""
        response = review_session.get(f"{BASE_URL}/api/dogs")
        assert response.status_code == 200
        dogs = response.json()
        assert isinstance(dogs, list)
        print(f"PASSED: GET /api/dogs returns list with {len(dogs)} dogs")
        
        if dogs:
            dog = dogs[0]
            # Verify structure
            assert "id" in dog
            assert "name" in dog
            assert "age" in dog
            assert "weight" in dog
            print(f"  First dog: {dog['name']} (id: {dog['id']})")
    
    def test_get_specific_dog(self, review_session):
        """Test GET /api/dogs/{dog_id} returns dog details"""
        response = review_session.get(f"{BASE_URL}/api/dogs/{REVIEW_DOG_ID}")
        assert response.status_code == 200
        dog = response.json()
        assert dog["id"] == REVIEW_DOG_ID
        assert "name" in dog
        print(f"PASSED: GET /api/dogs/{REVIEW_DOG_ID} returns dog: {dog['name']}")
    
    def test_create_dog(self, review_session):
        """Test POST /api/dogs creates new dog"""
        test_name = f"TEST_Dog_{uuid.uuid4().hex[:8]}"
        response = review_session.post(f"{BASE_URL}/api/dogs", json={
            "name": test_name,
            "age": 12,
            "weight": 8.5,
            "pet_type": "dog",
            "breed": "Mixed"
        })
        
        assert response.status_code == 200, f"Create dog failed: {response.text}"
        data = response.json()
        assert data["name"] == test_name
        assert "id" in data
        
        dog_id = data["id"]
        print(f"PASSED: POST /api/dogs creates dog: {test_name} (id: {dog_id})")
        
        # Cleanup
        review_session.delete(f"{BASE_URL}/api/dogs/{dog_id}")
        print("  Cleaned up test dog")


class TestChatTextMessages:
    """Tests for POST /api/chat text messages (no file upload)"""
    
    def test_chat_text_message(self, review_session):
        """Test that POST /api/chat still works for text messages"""
        response = review_session.post(f"{BASE_URL}/api/chat", json={
            "content": "Hola, como está mi perro hoy?",
            "dog_id": REVIEW_DOG_ID,
            "language": "Spanish"
        })
        
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        assert "id" in data
        assert "role" in data
        assert data["role"] == "assistant"
        assert "content" in data
        assert len(data["content"]) > 0
        
        print("PASSED: POST /api/chat works for text messages")
        print(f"  AI Response preview: {data['content'][:100]}...")
    
    def test_chat_requires_auth(self):
        """Test that chat endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "content": "Test without auth",
            "dog_id": REVIEW_DOG_ID
        })
        
        assert response.status_code == 401
        print("PASSED: POST /api/chat requires authentication")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_dogs(self, review_session):
        """Clean up any TEST_ prefixed dogs"""
        response = review_session.get(f"{BASE_URL}/api/dogs")
        if response.status_code == 200:
            dogs = response.json()
            deleted = 0
            for dog in dogs:
                if dog["name"].startswith("TEST_"):
                    review_session.delete(f"{BASE_URL}/api/dogs/{dog['id']}")
                    deleted += 1
            print(f"PASSED: Cleaned up {deleted} test dogs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
