"""
Test Pet Profile Edit - New fields (pet_type, sex, neutered, allergies)
Tests for the Edit Pet modal enhancement in profile screen.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pet-symptom-check-2.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "review@heimdall-ai.tech"
TEST_PASSWORD = "Heimdall2026"
DOG_ID = "5abbe9fb-9ee4-4c70-8eed-bd264c2fe3a5"


@pytest.fixture(scope="module")
def api_session():
    """Get authenticated session for API calls"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Login
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if response.status_code != 200:
        pytest.skip(f"Login failed: {response.status_code}")
    
    token = response.json().get("session_token")
    session.headers.update({"Authorization": f"Bearer {token}"})
    return session


class TestPetProfileNewFields:
    """Tests for new pet profile fields: pet_type, sex, neutered, allergies"""
    
    def test_get_dogs_returns_new_fields(self, api_session):
        """GET /api/dogs should return pet_type, sex, neutered, allergies fields"""
        response = api_session.get(f"{BASE_URL}/api/dogs")
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        dogs = response.json()
        assert isinstance(dogs, list), "Response should be a list"
        assert len(dogs) > 0, "Should have at least one dog"
        
        dog = dogs[0]
        # Verify new fields exist in response
        assert "pet_type" in dog, "pet_type field should exist"
        assert "sex" in dog, "sex field should exist"
        assert "neutered" in dog, "neutered field should exist"
        assert "allergies" in dog, "allergies field should exist"
        
        print(f"PASSED: GET /api/dogs returns all new fields (pet_type={dog.get('pet_type')}, sex={dog.get('sex')}, neutered={dog.get('neutered')}, allergies={dog.get('allergies')})")
    
    def test_update_dog_with_pet_type(self, api_session):
        """PUT /api/dogs/{id} should accept and persist pet_type field"""
        # Update with pet_type
        update_response = api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={
            "pet_type": "dog"
        })
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        
        # Verify persistence with GET
        get_response = api_session.get(f"{BASE_URL}/api/dogs")
        assert get_response.status_code == 200
        
        dogs = get_response.json()
        dog = next((d for d in dogs if d.get("id") == DOG_ID), None)
        assert dog is not None, f"Dog {DOG_ID} not found"
        assert dog.get("pet_type") == "dog", f"Expected pet_type='dog', got {dog.get('pet_type')}"
        
        print("PASSED: PUT /api/dogs accepts pet_type field")
    
    def test_update_dog_with_sex(self, api_session):
        """PUT /api/dogs/{id} should accept and persist sex field"""
        # Update with sex
        update_response = api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={
            "sex": "male"
        })
        
        assert update_response.status_code == 200
        
        # Verify persistence
        get_response = api_session.get(f"{BASE_URL}/api/dogs")
        dogs = get_response.json()
        dog = next((d for d in dogs if d.get("id") == DOG_ID), None)
        assert dog.get("sex") == "male", f"Expected sex='male', got {dog.get('sex')}"
        
        print("PASSED: PUT /api/dogs accepts sex field")
    
    def test_update_dog_with_neutered(self, api_session):
        """PUT /api/dogs/{id} should accept and persist neutered field"""
        # Update with neutered=true
        update_response = api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={
            "neutered": True
        })
        
        assert update_response.status_code == 200
        
        # Verify persistence
        get_response = api_session.get(f"{BASE_URL}/api/dogs")
        dogs = get_response.json()
        dog = next((d for d in dogs if d.get("id") == DOG_ID), None)
        assert dog.get("neutered") == True, f"Expected neutered=True, got {dog.get('neutered')}"
        
        print("PASSED: PUT /api/dogs accepts neutered field")
    
    def test_update_dog_with_allergies(self, api_session):
        """PUT /api/dogs/{id} should accept and persist allergies field"""
        test_allergies = "Chicken, Corn, Wheat"
        
        update_response = api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={
            "allergies": test_allergies
        })
        
        assert update_response.status_code == 200
        
        # Verify persistence
        get_response = api_session.get(f"{BASE_URL}/api/dogs")
        dogs = get_response.json()
        dog = next((d for d in dogs if d.get("id") == DOG_ID), None)
        assert dog.get("allergies") == test_allergies, f"Expected allergies='{test_allergies}', got {dog.get('allergies')}"
        
        print("PASSED: PUT /api/dogs accepts allergies field")
    
    def test_update_dog_all_new_fields_at_once(self, api_session):
        """PUT /api/dogs/{id} should accept all new fields in single request"""
        update_payload = {
            "pet_type": "dog",
            "sex": "female",
            "neutered": False,
            "allergies": "None known"
        }
        
        update_response = api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json=update_payload)
        assert update_response.status_code == 200
        
        # Verify all fields persisted
        get_response = api_session.get(f"{BASE_URL}/api/dogs")
        dogs = get_response.json()
        dog = next((d for d in dogs if d.get("id") == DOG_ID), None)
        
        assert dog.get("pet_type") == "dog"
        assert dog.get("sex") == "female"
        assert dog.get("neutered") == False
        assert dog.get("allergies") == "None known"
        
        print("PASSED: PUT /api/dogs accepts all new fields in single request")
    
    def test_update_dog_with_different_pet_types(self, api_session):
        """PUT /api/dogs/{id} should accept all valid pet_type values"""
        valid_pet_types = ["dog", "cat", "rodent", "bird"]
        
        for pet_type in valid_pet_types:
            update_response = api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={
                "pet_type": pet_type
            })
            assert update_response.status_code == 200, f"Failed for pet_type={pet_type}"
        
        # Reset to dog
        api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={"pet_type": "dog"})
        
        print("PASSED: PUT /api/dogs accepts all valid pet_type values (dog, cat, rodent, bird)")


class TestDogUpdateModel:
    """Tests for DogUpdate model validation"""
    
    def test_partial_update_only_name(self, api_session):
        """Should allow updating only name without affecting other fields"""
        # Get current state
        get_response = api_session.get(f"{BASE_URL}/api/dogs")
        dogs = get_response.json()
        original_dog = next((d for d in dogs if d.get("id") == DOG_ID), None)
        
        # Update only name
        update_response = api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={
            "name": "MaxTest"
        })
        assert update_response.status_code == 200
        
        # Verify only name changed
        get_response = api_session.get(f"{BASE_URL}/api/dogs")
        dogs = get_response.json()
        updated_dog = next((d for d in dogs if d.get("id") == DOG_ID), None)
        
        assert updated_dog.get("name") == "MaxTest"
        # Other fields should remain unchanged
        assert updated_dog.get("breed") == original_dog.get("breed")
        
        # Reset name
        api_session.put(f"{BASE_URL}/api/dogs/{DOG_ID}", json={"name": "Max"})
        
        print("PASSED: Partial update works correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
