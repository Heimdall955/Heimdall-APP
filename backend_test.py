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
BACKEND_URL = "https://hani-achievements-ui.preview.emergentagent.com"

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

    def test_gamification_register_new_user(self):
        """Test gamification flow: Register a new user for gamification testing"""
        try:
            user_data = {
                "email": "tester_gamification@test.com",
                "password": "123456",
                "name": "Tester Gamification"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=user_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "session_token" in data and "user" in data:
                    # Store new session for gamification tests
                    self.gamification_token = data["session_token"]
                    self.gamification_user = data["user"]
                    self.log_test("Gamification User Registration", True, f"User ID: {self.gamification_user.get('user_id')}")
                    return True
                else:
                    self.log_test("Gamification User Registration", False, "Missing session_token or user in response", data)
                    return False
            elif response.status_code == 400 and "ya está registrado" in response.text:
                # User already exists, try to login
                login_data = {
                    "email": "tester_gamification@test.com",
                    "password": "123456"
                }
                
                login_response = requests.post(
                    f"{self.base_url}/api/auth/login",
                    json=login_data,
                    timeout=10
                )
                
                if login_response.status_code == 200:
                    data = login_response.json()
                    self.gamification_token = data["session_token"]
                    self.gamification_user = data["user"]
                    self.log_test("Gamification User Registration", True, "User exists, logged in successfully")
                    return True
                else:
                    self.log_test("Gamification User Registration", False, f"Login failed: HTTP {login_response.status_code}", login_response.text)
                    return False
            else:
                self.log_test("Gamification User Registration", False, f"HTTP {response.status_code}", response.text)
                return False
                    
        except Exception as e:
            self.log_test("Gamification User Registration", False, f"Exception: {str(e)}")
            return False

    def test_initial_gamification_stats(self):
        """Test GET /api/gamification/stats - should show initial zeros"""
        if not hasattr(self, 'gamification_token') or not self.gamification_token:
            self.log_test("Initial Gamification Stats", False, "No gamification session token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.gamification_token}"}
            response = requests.get(
                f"{self.base_url}/api/gamification/stats",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["bones", "xp", "level", "level_progress", "streak_days", "exercises_completed"]
                missing_fields = [field for field in expected_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Initial Gamification Stats", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Check initial values
                if (data["bones"] == 0 and data["xp"] == 0 and data["level"] == 1 and 
                    data["level_progress"] == 0 and data["streak_days"] == 0 and data["exercises_completed"] == 0):
                    self.log_test("Initial Gamification Stats", True, "All initial stats are correct zeros/ones")
                    return True
                else:
                    self.log_test("Initial Gamification Stats", False, f"Stats not at initial values: {data}")
                    return False
            else:
                self.log_test("Initial Gamification Stats", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Initial Gamification Stats", False, f"Exception: {str(e)}")
            return False

    def test_first_lesson_bones_achievement(self):
        """Test POST /api/gamification/add-bones - first lesson should trigger achievement"""
        if not hasattr(self, 'gamification_token') or not self.gamification_token:
            self.log_test("First Lesson Achievement", False, "No gamification session token available")
            return False
            
        try:
            bones_data = {
                "amount": 15,
                "reason": "Lesson completed",
                "lesson_id": "test-lesson-1"
            }
            
            headers = {"Authorization": f"Bearer {self.gamification_token}"}
            response = requests.post(
                f"{self.base_url}/api/gamification/add-bones",
                json=bones_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["bones", "bones_added", "xp", "xp_added", "level", "leveled_up", "exercises_completed", "new_achievements"]
                missing_fields = [field for field in expected_fields if field not in data]
                
                if missing_fields:
                    self.log_test("First Lesson Achievement", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Check that bones > 15 (should be 25 with first_lesson achievement bonus)
                if data["bones"] >= 25 and data["xp"] > 0 and data["exercises_completed"] == 1:
                    # Check if first_lesson achievement was triggered
                    achievements = data.get("new_achievements", [])
                    first_lesson_found = any(ach.get("id") == "first_lesson" for ach in achievements)
                    
                    if first_lesson_found and data["leveled_up"] == False:
                        self.log_test("First Lesson Achievement", True, f"Bones: {data['bones']}, XP: {data['xp']}, Exercises: {data['exercises_completed']}, Achievement unlocked")
                        return True
                    else:
                        self.log_test("First Lesson Achievement", False, f"First lesson achievement not found or unexpected level up. Achievements: {achievements}")
                        return False
                else:
                    self.log_test("First Lesson Achievement", False, f"Unexpected values: bones={data['bones']}, xp={data['xp']}, exercises={data['exercises_completed']}")
                    return False
            else:
                self.log_test("First Lesson Achievement", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("First Lesson Achievement", False, f"Exception: {str(e)}")
            return False

    def test_stats_after_first_lesson(self):
        """Test GET /api/gamification/stats after first lesson"""
        if not hasattr(self, 'gamification_token') or not self.gamification_token:
            self.log_test("Stats After First Lesson", False, "No gamification session token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.gamification_token}"}
            response = requests.get(
                f"{self.base_url}/api/gamification/stats",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check expected values after first lesson
                expected_bones = 25  # 15 + 10 bonus
                expected_xp = 30     # 15 * 2
                expected_level = 1
                expected_exercises = 1
                
                if (data["bones"] == expected_bones and data["xp"] == expected_xp and 
                    data["level"] == expected_level and data["exercises_completed"] == expected_exercises and
                    data["streak_days"] >= 1):
                    
                    # Check achievements
                    achievements = data.get("achievements_unlocked", [])
                    if "first_lesson" in achievements:
                        self.log_test("Stats After First Lesson", True, 
                                    f"Stats correct: bones={data['bones']}, xp={data['xp']}, level={data['level']}, exercises={data['exercises_completed']}, achievements={achievements}")
                        return True
                    else:
                        self.log_test("Stats After First Lesson", False, f"First lesson achievement not in unlocked list: {achievements}")
                        return False
                else:
                    self.log_test("Stats After First Lesson", False, 
                                f"Unexpected stats: bones={data['bones']} (expected {expected_bones}), xp={data['xp']} (expected {expected_xp})")
                    return False
            else:
                self.log_test("Stats After First Lesson", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Stats After First Lesson", False, f"Exception: {str(e)}")
            return False

    def test_second_lesson_no_achievement(self):
        """Test POST /api/gamification/add-bones - second lesson should NOT trigger first_lesson again"""
        if not hasattr(self, 'gamification_token') or not self.gamification_token:
            self.log_test("Second Lesson No Duplicate Achievement", False, "No gamification session token available")
            return False
            
        try:
            bones_data = {
                "amount": 20,
                "reason": "Second lesson",
                "lesson_id": "test-lesson-2"
            }
            
            headers = {"Authorization": f"Bearer {self.gamification_token}"}
            response = requests.post(
                f"{self.base_url}/api/gamification/add-bones",
                json=bones_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check that no new achievements were triggered
                new_achievements = data.get("new_achievements", [])
                expected_bones = 45  # 25 + 20
                expected_exercises = 2
                
                if (len(new_achievements) == 0 and data["bones"] == expected_bones and 
                    data["exercises_completed"] == expected_exercises):
                    self.log_test("Second Lesson No Duplicate Achievement", True, 
                                f"No duplicate achievements, bones={data['bones']}, exercises={data['exercises_completed']}")
                    return True
                else:
                    self.log_test("Second Lesson No Duplicate Achievement", False, 
                                f"Unexpected achievements or stats: achievements={new_achievements}, bones={data['bones']}, exercises={data['exercises_completed']}")
                    return False
            else:
                self.log_test("Second Lesson No Duplicate Achievement", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Second Lesson No Duplicate Achievement", False, f"Exception: {str(e)}")
            return False

    def test_achievements_list(self):
        """Test GET /api/gamification/achievements"""
        if not hasattr(self, 'gamification_token') or not self.gamification_token:
            self.log_test("Achievements List", False, "No gamification session token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.gamification_token}"}
            response = requests.get(
                f"{self.base_url}/api/gamification/achievements",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if ("achievements" in data and "total" in data and "unlocked_count" in data):
                    total = data["total"]
                    unlocked_count = data["unlocked_count"]
                    achievements = data["achievements"]
                    
                    # Should have at least 9 achievements total
                    if total >= 9 and unlocked_count == 1:
                        # Check that first_lesson is unlocked
                        first_lesson_unlocked = False
                        for ach in achievements:
                            if ach.get("id") == "first_lesson" and ach.get("unlocked") == True:
                                first_lesson_unlocked = True
                                break
                        
                        if first_lesson_unlocked:
                            self.log_test("Achievements List", True, 
                                        f"Total: {total}, Unlocked: {unlocked_count}, first_lesson unlocked correctly")
                            return True
                        else:
                            self.log_test("Achievements List", False, "First lesson achievement not marked as unlocked")
                            return False
                    else:
                        self.log_test("Achievements List", False, f"Unexpected counts: total={total}, unlocked={unlocked_count}")
                        return False
                else:
                    self.log_test("Achievements List", False, "Missing expected fields", data)
                    return False
            else:
                self.log_test("Achievements List", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Achievements List", False, f"Exception: {str(e)}")
            return False

    def test_unauthenticated_gamification_access(self):
        """Test GET /api/gamification/stats without authentication - should fail"""
        try:
            response = requests.get(
                f"{self.base_url}/api/gamification/stats",
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("Unauthenticated Access Denied", True, "Correctly returns 401 for unauthenticated request")
                return True
            else:
                self.log_test("Unauthenticated Access Denied", False, f"Expected 401 but got HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Unauthenticated Access Denied", False, f"Exception: {str(e)}")
            return False

    def test_level_up_mechanics(self):
        """Test POST /api/gamification/add-bones with large amount to test level-up"""
        if not hasattr(self, 'gamification_token') or not self.gamification_token:
            self.log_test("Level Up Mechanics", False, "No gamification session token available")
            return False
            
        try:
            bones_data = {
                "amount": 250,
                "reason": "Big lesson",
                "lesson_id": "test-lesson-big"
            }
            
            headers = {"Authorization": f"Bearer {self.gamification_token}"}
            response = requests.post(
                f"{self.base_url}/api/gamification/add-bones",
                json=bones_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # With previous 45 bones + 250 = 295 bones
                # Previous XP was 30 + (250 * 2) = 530 XP, which should be level 2 (500+ XP = level 2)
                expected_level = 2
                leveled_up = data.get("leveled_up", False)
                new_level = data.get("level", 1)
                
                if new_level >= expected_level and leveled_up:
                    self.log_test("Level Up Mechanics", True, 
                                f"Level up successful: new level={new_level}, leveled_up={leveled_up}")
                    return True
                else:
                    self.log_test("Level Up Mechanics", False, 
                                f"Level up failed: level={new_level}, leveled_up={leveled_up}, expected level >= {expected_level}")
                    return False
            else:
                self.log_test("Level Up Mechanics", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Level Up Mechanics", False, f"Exception: {str(e)}")
            return False

    def run_gamification_tests(self):
        """Run all gamification-specific tests"""
        print("\n" + "=" * 60)
        print("GAMIFICATION SYSTEM TEST SUITE")
        print("=" * 60)
        print(f"Testing gamification at: {self.base_url}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        gamification_tests = [
            self.test_gamification_register_new_user,
            self.test_initial_gamification_stats,
            self.test_first_lesson_bones_achievement,
            self.test_stats_after_first_lesson,
            self.test_second_lesson_no_achievement,
            self.test_achievements_list,
            self.test_unauthenticated_gamification_access,
            self.test_level_up_mechanics
        ]
        
        passed = 0
        total = len(gamification_tests)
        
        for test in gamification_tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print("GAMIFICATION TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r["success"] and any(test_name in r["test"] for test_name in 
                       ["Gamification", "Achievement", "Level Up", "Unauthenticated"])]
        if failed_tests:
            print("FAILED GAMIFICATION TESTS:")
            for test in failed_tests:
                print(f"❌ {test['test']}: {test['details']}")
        else:
            print("🎉 All gamification tests passed!")
        
        return passed == total
    
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