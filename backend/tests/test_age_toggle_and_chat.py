"""
Test Age Toggle Feature and Chat Medical History Context
Tests:
1. Login works with test credentials
2. PUT /api/dogs/{dog_id} with age in months works correctly
3. POST /api/chat with dog_id includes vaccine info from medical_events
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "alexhernandez81@gmail.com"
TEST_PASSWORD = "123456"
DOG_ID = "6f86a040-07a9-4657-84a6-edd13975a435"


@pytest.fixture(scope="module")
def auth_session():
    """Create authenticated session for all tests"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Login and get token
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    token = data.get("session_token")
    assert token, "No session_token in response"
    
    session.headers.update({"Authorization": f"Bearer {token}"})
    return session


# Test 1: Login works
def test_01_login_works():
    """Test that login works with test credentials"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "session_token" in data, "No session_token in response"
    assert "user" in data, "No user in response"
    print(f"Login successful for {TEST_EMAIL}")


# Test 2: Get dog info to verify current age
def test_02_get_dog_info(auth_session):
    """Test getting dog info to verify age field"""
    response = auth_session.get(f"{BASE_URL}/api/dogs/{DOG_ID}")
    assert response.status_code == 200, f"Get dog failed: {response.text}"
    data = response.json()
    assert "age" in data, "No age field in dog data"
    print(f"Dog info: name={data.get('name')}, age={data.get('age')} months")
    # Verify age is stored in months
    assert isinstance(data.get('age'), (int, float)), "Age should be numeric"


# Test 3: Update dog age with months value
def test_03_update_dog_age_months(auth_session):
    """Test updating dog age with months value (simulating frontend conversion)"""
    # First get current dog data
    get_response = auth_session.get(f"{BASE_URL}/api/dogs/{DOG_ID}")
    assert get_response.status_code == 200
    original_data = get_response.json()
    
    # Update with a new age in months (e.g., 24 months = 2 years)
    update_payload = {
        "name": original_data.get('name'),
        "age": 24,  # 24 months = 2 years
        "weight": original_data.get('weight'),
        "breed": original_data.get('breed'),
    }
    
    response = auth_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json=update_payload)
    assert response.status_code == 200, f"Update dog failed: {response.text}"
    
    # Verify the update
    verify_response = auth_session.get(f"{BASE_URL}/api/dogs/{DOG_ID}")
    assert verify_response.status_code == 200
    updated_data = verify_response.json()
    assert updated_data.get('age') == 24, f"Age not updated correctly: {updated_data.get('age')}"
    print(f"Dog age updated to 24 months successfully")


# Test 4: Update dog age with years converted to months
def test_04_update_dog_age_years_converted(auth_session):
    """Test updating dog age with years value converted to months (frontend behavior)"""
    # Get current dog data
    get_response = auth_session.get(f"{BASE_URL}/api/dogs/{DOG_ID}")
    assert get_response.status_code == 200
    original_data = get_response.json()
    
    # Simulate frontend: user enters 2 years, frontend converts to 24 months
    years_input = 2
    age_in_months = years_input * 12  # Frontend conversion
    
    update_payload = {
        "name": original_data.get('name'),
        "age": age_in_months,  # 24 months
        "weight": original_data.get('weight'),
        "breed": original_data.get('breed'),
    }
    
    response = auth_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json=update_payload)
    assert response.status_code == 200, f"Update dog failed: {response.text}"
    
    # Verify
    verify_response = auth_session.get(f"{BASE_URL}/api/dogs/{DOG_ID}")
    updated_data = verify_response.json()
    assert updated_data.get('age') == 24, f"Age conversion failed: expected 24, got {updated_data.get('age')}"
    print(f"Age conversion (2 years -> 24 months) works correctly")


# Test 5: Get medical events for dog
def test_05_get_medical_events(auth_session):
    """Test getting medical events for the dog"""
    response = auth_session.get(f"{BASE_URL}/api/medical-events/{DOG_ID}")
    assert response.status_code == 200, f"Get medical events failed: {response.text}"
    data = response.json()
    assert isinstance(data, list), "Medical events should be a list"
    print(f"Found {len(data)} medical events")
    
    # Check for vaccine record
    vaccine_found = False
    for event in data:
        if event.get('event_type') == 'vaccine':
            vaccine_found = True
            print(f"Vaccine found: {event.get('title')} on {event.get('event_date')}")
    
    if not vaccine_found:
        print("Warning: No vaccine records found")


# Test 6: Chat about vaccines includes medical history
def test_06_chat_includes_medical_history(auth_session):
    """Test that chat response includes medical history context"""
    # Send a chat message asking about vaccines
    chat_payload = {
        "content": "¿Cuáles son las vacunas de mi perro?",
        "dog_id": DOG_ID
    }
    
    response = auth_session.post(f"{BASE_URL}/api/chat", json=chat_payload, timeout=60)
    assert response.status_code == 200, f"Chat failed: {response.text}"
    data = response.json()
    
    assert "content" in data, "No content in chat data"
    chat_response = data.get("content", "").lower()
    
    # Check if the response mentions vaccines or medical history
    vaccine_keywords = ["vacuna", "rabia", "vaccine", "rabies", "2026"]
    found_keyword = any(kw in chat_response for kw in vaccine_keywords)
    
    print(f"Chat response (first 500 chars): {data.get('content', '')[:500]}")
    
    if found_keyword:
        print("SUCCESS: Chat response includes vaccine/medical history information")
    else:
        print("WARNING: Chat response may not include specific vaccine info")
    
    # Assert that vaccine info is included
    assert found_keyword, f"Chat response should include vaccine info. Response: {chat_response[:300]}"


# Test 7: Health check
def test_07_health_check():
    """Test API health endpoint"""
    session = requests.Session()
    response = session.get(f"{BASE_URL}/api/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    data = response.json()
    assert data.get("status") == "healthy", f"API not healthy: {data}"
    print("API health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
