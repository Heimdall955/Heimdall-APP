#!/usr/bin/env python3
"""
Heimdall Backend API Test Suite
Tests all backend endpoints for the Heimdall pet wellness app
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://caninehealth-hub.preview.emergentagent.com"

class HeimdallAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session_token = None
        self.user_data = None
        self.dog_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def test_health_check(self):
        """Test GET /api/ - Health check"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("Health Check", True, f"Status: {data.get('status')}")
                    return True
                else:
                    self.log_test("Health Check", False, "Missing expected fields in response", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_register(self):
        """Test POST /api/auth/register"""
        try:
            user_data = {
                "email": "newuser@test.com",
                "password": "test1234",
                "name": "Test User"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=user_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "session_token" in data and "user" in data:
                    self.session_token = data["session_token"]
                    self.user_data = data["user"]
                    self.log_test("User Registration", True, f"User ID: {self.user_data.get('user_id')}")
                    return True
                else:
                    self.log_test("User Registration", False, "Missing session_token or user in response", data)
                    return False
            else:
                # Check if user already exists
                if response.status_code == 400 and "ya está registrado" in response.text:
                    self.log_test("User Registration", True, "User already exists (expected for repeated tests)")
                    return True
                else:
                    self.log_test("User Registration", False, f"HTTP {response.status_code}", response.text)
                    return False
                    
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
            return False
    
    def test_login(self):
        """Test POST /api/auth/login"""
        try:
            login_data = {
                "email": "newuser@test.com",
                "password": "test1234"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "session_token" in data and "user" in data:
                    self.session_token = data["session_token"]
                    self.user_data = data["user"]
                    self.log_test("User Login", True, f"Session token received")
                    return True
                else:
                    self.log_test("User Login", False, "Missing session_token or user in response", data)
                    return False
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
            return False
    
    def test_get_current_user(self):
        """Test GET /api/auth/me"""
        if not self.session_token:
            self.log_test("Get Current User", False, "No session token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.get(
                f"{self.base_url}/api/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "email" in data:
                    self.log_test("Get Current User", True, f"User: {data.get('name')} ({data.get('email')})")
                    return True
                else:
                    self.log_test("Get Current User", False, "Missing expected user fields", data)
                    return False
            else:
                self.log_test("Get Current User", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
            return False
    
    def test_create_dog(self):
        """Test POST /api/dogs"""
        if not self.session_token:
            self.log_test("Create Dog Profile", False, "No session token available")
            return False
            
        try:
            dog_data = {
                "name": "Max",
                "age": 24,
                "weight": 15.0,
                "sex": "male",
                "breed": "Labrador"
            }
            
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.post(
                f"{self.base_url}/api/dogs",
                json=dog_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data:
                    self.dog_id = data["id"]
                    self.log_test("Create Dog Profile", True, f"Dog created: {data.get('name')} (ID: {self.dog_id})")
                    return True
                else:
                    self.log_test("Create Dog Profile", False, "Missing expected dog fields", data)
                    return False
            else:
                self.log_test("Create Dog Profile", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Dog Profile", False, f"Exception: {str(e)}")
            return False
    
    def test_get_dogs(self):
        """Test GET /api/dogs"""
        if not self.session_token:
            self.log_test("List User Dogs", False, "No session token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.get(
                f"{self.base_url}/api/dogs",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    dog_count = len(data)
                    self.log_test("List User Dogs", True, f"Found {dog_count} dog(s)")
                    return True
                else:
                    self.log_test("List User Dogs", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("List User Dogs", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("List User Dogs", False, f"Exception: {str(e)}")
            return False
    
    def test_chat_message(self):
        """Test POST /api/chat"""
        if not self.session_token:
            self.log_test("Send Chat Message", False, "No session token available")
            return False
            
        if not self.dog_id:
            self.log_test("Send Chat Message", False, "No dog ID available")
            return False
            
        try:
            chat_data = {
                "content": "Hola, necesito ayuda con mi perro",
                "dog_id": self.dog_id
            }
            
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=chat_data,
                headers=headers,
                timeout=30  # Longer timeout for LLM response
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "content" in data and "role" in data:
                    content_preview = data.get("content", "")[:100] + "..." if len(data.get("content", "")) > 100 else data.get("content", "")
                    self.log_test("Send Chat Message", True, f"Response received: {content_preview}")
                    return True
                else:
                    self.log_test("Send Chat Message", False, "Missing expected message fields", data)
                    return False
            else:
                self.log_test("Send Chat Message", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Send Chat Message", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("=" * 60)
        print("HEIMDALL BACKEND API TEST SUITE")
        print("=" * 60)
        print(f"Testing backend at: {self.base_url}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run tests in order
        tests = [
            self.test_health_check,
            self.test_register,
            self.test_login,
            self.test_get_current_user,
            self.test_create_dog,
            self.test_get_dogs,
            self.test_chat_message
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            print("FAILED TESTS:")
            for test in failed_tests:
                print(f"❌ {test['test']}: {test['details']}")
        else:
            print("🎉 All tests passed!")
        
        return passed == total

if __name__ == "__main__":
    tester = HeimdallAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)