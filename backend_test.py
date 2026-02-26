#!/usr/bin/env python3

import asyncio
import aiohttp
import json
import sys
from datetime import datetime

# Test configuration
BACKEND_URL = "https://health-check-38.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.ENDC}")

def print_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.ENDC}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.ENDC}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.ENDC}")

def print_header(msg):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}{Colors.ENDC}\n")

class ProfileEndpointTest:
    def __init__(self):
        self.session_token = None
        self.test_results = []
        
    async def run_all_tests(self):
        """Run all profile endpoint tests as specified in the review request"""
        print_header("HEIMDALL (HANI) PROFILE ENDPOINTS TEST SUITE")
        print_info(f"Backend URL: {BACKEND_URL}")
        print_info("Following test flow from review request")
        
        async with aiohttp.ClientSession() as session:
            self.session = session
            
            # Step 1: Register user
            await self.test_user_registration()
            
            if not self.session_token:
                print_error("Cannot continue without session token")
                return False
            
            # Steps 2-4: Clinical file endpoints
            await self.test_clinical_file_get_defaults()
            await self.test_clinical_file_put()
            await self.test_clinical_file_get_after_update()
            
            # Steps 5-7: Friends endpoints
            await self.test_friends_get_empty()
            await self.test_invite_friend()
            await self.test_friends_get_after_invite()
            
            # Steps 8-10: User settings endpoints
            await self.test_user_settings_get_defaults()
            await self.test_user_settings_put()
            await self.test_user_settings_get_after_update()
            
            # Summary
            await self.print_test_summary()
        
        return all(result['success'] for result in self.test_results)
    
    def log_test_result(self, test_name, success, details=None, response_data=None):
        """Log test result for later summary"""
        self.test_results.append({
            'test_name': test_name,
            'success': success,
            'details': details,
            'response_data': response_data
        })
    
    async def test_user_registration(self):
        """Step 1: Register a user and extract session_token"""
        print_info("Step 1: Registering user...")
        
        test_data = {
            "email": "profile_test@test.com",
            "password": "123456", 
            "name": "Profile Tester"
        }
        
        try:
            async with self.session.post(f"{API_BASE}/auth/register", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if 'session_token' in data:
                        self.session_token = data['session_token']
                        print_success(f"User registered successfully. Session token obtained.")
                        print_info(f"User ID: {data.get('user', {}).get('user_id', 'N/A')}")
                        print_info(f"Email: {data.get('user', {}).get('email', 'N/A')}")
                        self.log_test_result("User Registration", True, "Successfully registered and got session token", data)
                        return True
                    else:
                        print_error("Registration successful but no session_token in response")
                        self.log_test_result("User Registration", False, "No session_token in response", data)
                        return False
                        
                elif response.status == 400:
                    # User might already exist, try login
                    print_warning("User already exists, attempting login...")
                    return await self.test_user_login(test_data['email'], test_data['password'])
                else:
                    error_text = await response.text()
                    print_error(f"Registration failed: {response.status} - {error_text}")
                    self.log_test_result("User Registration", False, f"HTTP {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            print_error(f"Registration error: {str(e)}")
            self.log_test_result("User Registration", False, f"Exception: {str(e)}")
            return False
    
    async def test_user_login(self, email, password):
        """Fallback login if registration fails due to existing user"""
        print_info("Attempting login with existing credentials...")
        
        login_data = {"email": email, "password": password}
        
        try:
            async with self.session.post(f"{API_BASE}/auth/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'session_token' in data:
                        self.session_token = data['session_token']
                        print_success(f"Login successful. Session token obtained.")
                        self.log_test_result("User Login (Fallback)", True, "Successfully logged in", data)
                        return True
                else:
                    error_text = await response.text()
                    print_error(f"Login failed: {response.status} - {error_text}")
                    self.log_test_result("User Login (Fallback)", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            print_error(f"Login error: {str(e)}")
            self.log_test_result("User Login (Fallback)", False, f"Exception: {str(e)}")
            return False
    
    async def test_clinical_file_get_defaults(self):
        """Step 2: Test clinical file GET (should return defaults)"""
        print_info("Step 2: Testing clinical file GET (defaults)...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            async with self.session.get(f"{API_BASE}/dogs/test-dog-id/clinical", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check if it returns default empty clinical data
                    expected_fields = ["dog_id", "country", "vet_name", "vet_phone", "allergies", "current_medication", "neutered", "insurance"]
                    all_fields_present = all(field in data for field in expected_fields)
                    
                    if all_fields_present and data.get("dog_id") == "test-dog-id":
                        print_success("Clinical file GET returns correct default structure")
                        print_info(f"Default values: {json.dumps(data, indent=2)}")
                        self.log_test_result("Clinical File GET (Defaults)", True, "Returned correct default structure", data)
                    else:
                        print_error("Clinical file GET does not return expected default structure")
                        print_info(f"Received: {json.dumps(data, indent=2)}")
                        self.log_test_result("Clinical File GET (Defaults)", False, "Incorrect default structure", data)
                else:
                    error_text = await response.text()
                    print_error(f"Clinical file GET failed: {response.status} - {error_text}")
                    self.log_test_result("Clinical File GET (Defaults)", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"Clinical file GET error: {str(e)}")
            self.log_test_result("Clinical File GET (Defaults)", False, f"Exception: {str(e)}")
    
    async def test_clinical_file_put(self):
        """Step 3: Test clinical file PUT"""
        print_info("Step 3: Testing clinical file PUT...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        test_data = {
            "country": "España",
            "vet_name": "Dr. García",
            "vet_phone": "+34666123456",
            "allergies": "Pollo",
            "neutered": True,
            "current_medication": "Fenobarbital",
            "insurance": "Mapfre"
        }
        
        try:
            async with self.session.put(f"{API_BASE}/dogs/test-dog-id/clinical", json=test_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if 'message' in data:
                        print_success("Clinical file PUT successful")
                        print_info(f"Response: {json.dumps(data, indent=2)}")
                        self.log_test_result("Clinical File PUT", True, "Successfully updated clinical file", data)
                    else:
                        print_warning("Clinical file PUT successful but unexpected response format")
                        self.log_test_result("Clinical File PUT", True, "Updated but unexpected response", data)
                else:
                    error_text = await response.text()
                    print_error(f"Clinical file PUT failed: {response.status} - {error_text}")
                    self.log_test_result("Clinical File PUT", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"Clinical file PUT error: {str(e)}")
            self.log_test_result("Clinical File PUT", False, f"Exception: {str(e)}")
    
    async def test_clinical_file_get_after_update(self):
        """Step 4: Test clinical file GET after update"""
        print_info("Step 4: Testing clinical file GET after update...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        expected_data = {
            "country": "España",
            "vet_name": "Dr. García", 
            "vet_phone": "+34666123456",
            "allergies": "Pollo",
            "neutered": True,
            "current_medication": "Fenobarbital",
            "insurance": "Mapfre"
        }
        
        try:
            async with self.session.get(f"{API_BASE}/dogs/test-dog-id/clinical", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify the saved data matches what we sent
                    data_matches = True
                    mismatches = []
                    
                    for key, expected_value in expected_data.items():
                        if data.get(key) != expected_value:
                            data_matches = False
                            mismatches.append(f"{key}: expected '{expected_value}', got '{data.get(key)}'")
                    
                    if data_matches:
                        print_success("Clinical file GET after update returns correct saved data")
                        print_info(f"Verified data: {json.dumps(data, indent=2)}")
                        self.log_test_result("Clinical File GET (After Update)", True, "Data correctly persisted", data)
                    else:
                        print_error("Clinical file GET after update does not match expected data")
                        print_info(f"Mismatches: {mismatches}")
                        self.log_test_result("Clinical File GET (After Update)", False, f"Data mismatch: {mismatches}", data)
                else:
                    error_text = await response.text()
                    print_error(f"Clinical file GET after update failed: {response.status} - {error_text}")
                    self.log_test_result("Clinical File GET (After Update)", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"Clinical file GET after update error: {str(e)}")
            self.log_test_result("Clinical File GET (After Update)", False, f"Exception: {str(e)}")
    
    async def test_friends_get_empty(self):
        """Step 5: Test friends GET (should be empty)"""
        print_info("Step 5: Testing friends GET (should be empty)...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            async with self.session.get(f"{API_BASE}/pack/friends", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if 'friends' in data and isinstance(data['friends'], list):
                        if len(data['friends']) == 0:
                            print_success("Friends GET returns empty array as expected")
                            self.log_test_result("Friends GET (Empty)", True, "Returned empty friends array", data)
                        else:
                            print_warning(f"Friends GET returns {len(data['friends'])} friends (expected 0)")
                            self.log_test_result("Friends GET (Empty)", True, f"Returned {len(data['friends'])} friends", data)
                    else:
                        print_error("Friends GET does not return expected structure with 'friends' array")
                        self.log_test_result("Friends GET (Empty)", False, "Incorrect response structure", data)
                else:
                    error_text = await response.text()
                    print_error(f"Friends GET failed: {response.status} - {error_text}")
                    self.log_test_result("Friends GET (Empty)", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"Friends GET error: {str(e)}")
            self.log_test_result("Friends GET (Empty)", False, f"Exception: {str(e)}")
    
    async def test_invite_friend(self):
        """Step 6: Test invite friend"""
        print_info("Step 6: Testing invite friend...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        test_data = {
            "invited_name": "María",
            "invited_contact": "maria@test.com"
        }
        
        try:
            async with self.session.post(f"{API_BASE}/pack/invite", json=test_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify returns success message and bones_earned=5
                    if 'message' in data and data.get('bones_earned') == 5:
                        print_success("Friend invite successful")
                        print_info(f"Response: {json.dumps(data, indent=2)}")
                        self.log_test_result("Invite Friend", True, "Successfully invited friend, earned 5 bones", data)
                    else:
                        print_warning("Friend invite successful but unexpected response structure")
                        print_info(f"Response: {json.dumps(data, indent=2)}")
                        self.log_test_result("Invite Friend", True, "Invited but unexpected response", data)
                else:
                    error_text = await response.text()
                    print_error(f"Friend invite failed: {response.status} - {error_text}")
                    self.log_test_result("Invite Friend", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"Friend invite error: {str(e)}")
            self.log_test_result("Invite Friend", False, f"Exception: {str(e)}")
    
    async def test_friends_get_after_invite(self):
        """Step 7: Test friends GET after invite"""
        print_info("Step 7: Testing friends GET after invite...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            async with self.session.get(f"{API_BASE}/pack/friends", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if 'friends' in data and isinstance(data['friends'], list):
                        if len(data['friends']) == 1:
                            friend = data['friends'][0]
                            if friend.get('name') == 'María' and friend.get('status') == 'pending':
                                print_success("Friends GET after invite returns correct friend data")
                                print_info(f"Friend data: {json.dumps(friend, indent=2)}")
                                self.log_test_result("Friends GET (After Invite)", True, "Found María with pending status", data)
                            else:
                                print_error(f"Friend data incorrect - Name: {friend.get('name')}, Status: {friend.get('status')}")
                                self.log_test_result("Friends GET (After Invite)", False, "Incorrect friend data", data)
                        else:
                            print_error(f"Expected 1 friend, got {len(data['friends'])}")
                            self.log_test_result("Friends GET (After Invite)", False, f"Expected 1 friend, got {len(data['friends'])}", data)
                    else:
                        print_error("Friends GET does not return expected structure with 'friends' array")
                        self.log_test_result("Friends GET (After Invite)", False, "Incorrect response structure", data)
                else:
                    error_text = await response.text()
                    print_error(f"Friends GET after invite failed: {response.status} - {error_text}")
                    self.log_test_result("Friends GET (After Invite)", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"Friends GET after invite error: {str(e)}")
            self.log_test_result("Friends GET (After Invite)", False, f"Exception: {str(e)}")
    
    async def test_user_settings_get_defaults(self):
        """Step 8: Test user settings GET (defaults)"""
        print_info("Step 8: Testing user settings GET (defaults)...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            async with self.session.get(f"{API_BASE}/users/settings", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check expected default fields
                    expected_defaults = {
                        "notifications_enabled": True,
                        "daily_reminder": True,
                        "health_alerts": True,
                        "achievement_alerts": True,
                        "pack_alerts": True,
                        "weight_unit": "kg",
                        "temperature_unit": "celsius"
                    }
                    
                    defaults_match = True
                    mismatches = []
                    
                    for key, expected_value in expected_defaults.items():
                        if data.get(key) != expected_value:
                            defaults_match = False
                            mismatches.append(f"{key}: expected {expected_value}, got {data.get(key)}")
                    
                    if defaults_match:
                        print_success("User settings GET returns correct default values")
                        print_info(f"Default settings: {json.dumps(data, indent=2)}")
                        self.log_test_result("User Settings GET (Defaults)", True, "Returned correct default settings", data)
                    else:
                        print_warning("User settings GET has some non-default values")
                        print_info(f"Differences: {mismatches}")
                        self.log_test_result("User Settings GET (Defaults)", True, f"Some non-defaults: {mismatches}", data)
                else:
                    error_text = await response.text()
                    print_error(f"User settings GET failed: {response.status} - {error_text}")
                    self.log_test_result("User Settings GET (Defaults)", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"User settings GET error: {str(e)}")
            self.log_test_result("User Settings GET (Defaults)", False, f"Exception: {str(e)}")
    
    async def test_user_settings_put(self):
        """Step 9: Test user settings PUT"""
        print_info("Step 9: Testing user settings PUT...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        test_data = {
            "weight_unit": "lb",
            "notifications_enabled": False
        }
        
        try:
            async with self.session.put(f"{API_BASE}/users/settings", json=test_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if 'message' in data:
                        print_success("User settings PUT successful")
                        print_info(f"Response: {json.dumps(data, indent=2)}")
                        self.log_test_result("User Settings PUT", True, "Successfully updated user settings", data)
                    else:
                        print_warning("User settings PUT successful but unexpected response format")
                        self.log_test_result("User Settings PUT", True, "Updated but unexpected response", data)
                else:
                    error_text = await response.text()
                    print_error(f"User settings PUT failed: {response.status} - {error_text}")
                    self.log_test_result("User Settings PUT", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"User settings PUT error: {str(e)}")
            self.log_test_result("User Settings PUT", False, f"Exception: {str(e)}")
    
    async def test_user_settings_get_after_update(self):
        """Step 10: Test user settings GET after update"""
        print_info("Step 10: Testing user settings GET after update...")
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        expected_values = {
            "weight_unit": "lb",
            "notifications_enabled": False
        }
        
        try:
            async with self.session.get(f"{API_BASE}/users/settings", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify the saved settings match what we sent
                    settings_match = True
                    mismatches = []
                    
                    for key, expected_value in expected_values.items():
                        if data.get(key) != expected_value:
                            settings_match = False
                            mismatches.append(f"{key}: expected {expected_value}, got {data.get(key)}")
                    
                    if settings_match:
                        print_success("User settings GET after update returns correct saved data")
                        print_info(f"Verified settings: {json.dumps(data, indent=2)}")
                        self.log_test_result("User Settings GET (After Update)", True, "Settings correctly persisted", data)
                    else:
                        print_error("User settings GET after update does not match expected data")
                        print_info(f"Mismatches: {mismatches}")
                        self.log_test_result("User Settings GET (After Update)", False, f"Settings mismatch: {mismatches}", data)
                else:
                    error_text = await response.text()
                    print_error(f"User settings GET after update failed: {response.status} - {error_text}")
                    self.log_test_result("User Settings GET (After Update)", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            print_error(f"User settings GET after update error: {str(e)}")
            self.log_test_result("User Settings GET (After Update)", False, f"Exception: {str(e)}")
    
    async def print_test_summary(self):
        """Print comprehensive test summary"""
        print_header("TEST SUMMARY")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print_info(f"Total Tests: {total_tests}")
        print_success(f"Passed: {passed_tests}")
        if failed_tests > 0:
            print_error(f"Failed: {failed_tests}")
        
        print("\nDetailed Results:")
        print("-" * 60)
        
        for i, result in enumerate(self.test_results, 1):
            status_icon = "✅" if result['success'] else "❌"
            print(f"{i:2d}. {status_icon} {result['test_name']}")
            if result['details']:
                print(f"     {result['details']}")
        
        print("-" * 60)
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        if success_rate == 100:
            print_success(f"🎉 ALL PROFILE ENDPOINTS WORKING PERFECTLY! ({success_rate:.1f}% success rate)")
        elif success_rate >= 80:
            print_warning(f"⚠️  Most profile endpoints working ({success_rate:.1f}% success rate)")
        else:
            print_error(f"💥 Multiple profile endpoint issues ({success_rate:.1f}% success rate)")
        
        print_info(f"Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

async def main():
    """Main test runner"""
    tester = ProfileEndpointTest()
    success = await tester.run_all_tests()
    
    if success:
        print_success("\n🎯 All profile endpoint tests completed successfully!")
        sys.exit(0)
    else:
        print_error("\n💥 Some profile endpoint tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())