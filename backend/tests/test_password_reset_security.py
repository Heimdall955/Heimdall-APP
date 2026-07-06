"""
Test Password Reset Security Fix
================================
Verifies that the password reset endpoint no longer leaks the 6-digit PIN in the response.
The code should be sent via email only, not in the API response.

Security Bug Fixed:
- POST /api/auth/request-reset was returning {"message": ..., "code": code}
- Now returns ONLY {"message": ...} without the code field
"""

import pytest
import requests
import os
import uuid

# Use localhost for testing since we're in the same environment
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001').rstrip('/')

# Test credentials from test_credentials.md
TEST_USER_EMAIL = "alexhernandez81@gmail.com"
TEST_USER_PASSWORD = "123456"


class TestPasswordResetSecurity:
    """Tests for password reset security fix - code should NOT be in response"""
    
    def test_health_check(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health check passed")
    
    def test_login_with_existing_credentials(self):
        """Test that login still works with existing credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "session_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        print(f"✓ Login successful for {TEST_USER_EMAIL}")
    
    def test_request_reset_valid_email_no_code_in_response(self):
        """
        CRITICAL SECURITY TEST: POST /api/auth/request-reset with valid email
        should return ONLY {"message": ...} WITHOUT any 'code' field.
        """
        response = requests.post(
            f"{BASE_URL}/api/auth/request-reset",
            json={"email": TEST_USER_EMAIL}
        )
        assert response.status_code == 200, f"Request reset failed: {response.text}"
        data = response.json()
        
        # CRITICAL: Verify 'code' is NOT in the response
        assert "code" not in data, f"SECURITY BUG: 'code' field found in response! Response: {data}"
        
        # Verify message is present
        assert "message" in data, f"Expected 'message' field in response. Got: {data}"
        
        # Verify the message is the expected generic message
        expected_message = "Si el email existe, recibirás un código de recuperación"
        assert data["message"] == expected_message, f"Unexpected message: {data['message']}"
        
        print("✓ SECURITY VERIFIED: No 'code' field in response for valid email")
        print(f"  Response: {data}")
    
    def test_request_reset_nonexistent_email_no_code_in_response(self):
        """
        SECURITY TEST: POST /api/auth/request-reset with non-existent email
        should return the same generic message without leaking whether email exists.
        """
        fake_email = f"nonexistent_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/request-reset",
            json={"email": fake_email}
        )
        assert response.status_code == 200, f"Request reset failed: {response.text}"
        data = response.json()
        
        # CRITICAL: Verify 'code' is NOT in the response
        assert "code" not in data, f"SECURITY BUG: 'code' field found in response! Response: {data}"
        
        # Verify message is present and is the same generic message (prevents email enumeration)
        assert "message" in data, f"Expected 'message' field in response. Got: {data}"
        expected_message = "Si el email existe, recibirás un código de recuperación"
        assert data["message"] == expected_message, f"Unexpected message: {data['message']}"
        
        print("✓ SECURITY VERIFIED: No 'code' field in response for non-existent email")
        print(f"  Response: {data}")
    
    def test_reset_password_rejects_invalid_code(self):
        """
        Test that POST /api/auth/reset-password rejects invalid codes with 400.
        """
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "email": TEST_USER_EMAIL,
                "code": "000000",  # Invalid code
                "new_password": "newpassword123"
            }
        )
        # Should return 400 for invalid code or no reset request
        assert response.status_code == 400, f"Expected 400 for invalid code, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Reset password correctly rejects invalid code: {data['detail']}")
    
    def test_reset_password_rejects_nonexistent_email(self):
        """
        Test that POST /api/auth/reset-password rejects email with no reset request.
        """
        fake_email = f"nonexistent_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "email": fake_email,
                "code": "123456",
                "new_password": "newpassword123"
            }
        )
        # Should return 400 for no reset request
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Reset password correctly rejects non-existent email: {data['detail']}")
    
    def test_request_reset_response_structure(self):
        """
        Verify the response structure only contains 'message' field.
        """
        response = requests.post(
            f"{BASE_URL}/api/auth/request-reset",
            json={"email": TEST_USER_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify ONLY 'message' key exists
        allowed_keys = {"message"}
        actual_keys = set(data.keys())
        
        unexpected_keys = actual_keys - allowed_keys
        assert not unexpected_keys, f"SECURITY: Unexpected keys in response: {unexpected_keys}. Full response: {data}"
        
        print(f"✓ Response structure verified - only contains: {list(data.keys())}")


class TestLoginStillWorks:
    """Verify login functionality is not broken by the security fix"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        print(f"✓ Login works correctly")
    
    def test_login_invalid_password(self):
        """Test login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Login correctly rejects invalid password")
    
    def test_login_invalid_email(self):
        """Test login fails with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "anypassword"}
        )
        assert response.status_code == 401
        print("✓ Login correctly rejects non-existent email")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
