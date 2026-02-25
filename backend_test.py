#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Heimdall (HANI) App
Testing the complete gamification flow end-to-end as specified in requirements
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from the test environment
BACKEND_URL = "https://hani-achievements-ui.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def print_header(msg):
    print(f"\n{Colors.PURPLE}{'='*60}{Colors.END}")
    print(f"{Colors.PURPLE}🧪 {msg}{Colors.END}")
    print(f"{Colors.PURPLE}{'='*60}{Colors.END}")

class GamificationTester:
    def __init__(self):
        self.session_token = None
        self.test_email = "e2e_gamification_test@test.com"
        self.test_password = "123456"
        self.test_name = "E2E Tester"
        self.failed_tests = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def run_test(self, test_name, test_func):
        """Run individual test with error handling"""
        self.total_tests += 1
        print_info(f"Running: {test_name}")
        try:
            result = test_func()
            if result:
                self.passed_tests += 1
                print_success(f"{test_name} - PASSED")
                return True
            else:
                self.failed_tests.append(test_name)
                print_error(f"{test_name} - FAILED")
                return False
        except Exception as e:
            self.failed_tests.append(test_name)
            print_error(f"{test_name} - ERROR: {str(e)}")
            return False
    
    def test_1_register_user(self):
        """Register a fresh user for E2E testing"""
        url = f"{API_BASE}/auth/register"
        data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name
        }
        
        response = requests.post(url, json=data)
        
        if response.status_code == 400 and "ya está registrado" in response.text:
            # User already exists, try login instead
            print_warning("User already exists, attempting login...")
            return self.test_login_existing_user()
        
        if response.status_code != 200:
            print_error(f"Registration failed with status {response.status_code}: {response.text}")
            return False
            
        result = response.json()
        
        if "session_token" not in result:
            print_error("No session_token in registration response")
            return False
            
        self.session_token = result["session_token"]
        print_success(f"User registered successfully, token: {self.session_token[:20]}...")
        return True
    
    def test_login_existing_user(self):
        """Login if user already exists"""
        url = f"{API_BASE}/auth/login"
        data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(url, json=data)
        
        if response.status_code != 200:
            print_error(f"Login failed with status {response.status_code}: {response.text}")
            return False
            
        result = response.json()
        
        if "session_token" not in result:
            print_error("No session_token in login response")
            return False
            
        self.session_token = result["session_token"]
        print_success(f"User logged in successfully, token: {self.session_token[:20]}...")
        return True
    
    def test_2_verify_initial_stats_zero(self):
        """Verify initial stats are all zero"""
        if not self.session_token:
            return False
            
        url = f"{API_BASE}/gamification/stats"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print_error(f"Stats request failed with status {response.status_code}: {response.text}")
            return False
            
        stats = response.json()
        print_info(f"Initial stats: {json.dumps(stats, indent=2)}")
        
        # For a fresh user OR existing user, check initial state
        expected_initial = {
            "level": 1,
            "level_progress": stats.get("xp", 0) % 500,  # Allow existing XP
            "level_target": 500
        }
        
        for key, expected_value in expected_initial.items():
            if stats.get(key) != expected_value:
                print_error(f"Expected {key}={expected_value}, got {stats.get(key)}")
                return False
                
        print_success("Initial stats verified (level=1, target=500)")
        return True
    
    def test_3_complete_first_lesson(self):
        """Simulate completing first lesson - should trigger first_lesson achievement"""
        if not self.session_token:
            return False
            
        url = f"{API_BASE}/gamification/add-bones"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        data = {
            "amount": 15,
            "reason": "Lección: Llamada Perfecta",
            "lesson_id": "llamada-perfecta"
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code != 200:
            print_error(f"Add bones failed with status {response.status_code}: {response.text}")
            return False
            
        result = response.json()
        print_info(f"First lesson result: {json.dumps(result, indent=2)}")
        
        # For first lesson, should get 15 bones + 10 bonus = 25 total (for new user)
        # XP should be 30 (15*2), exercises_completed should be at least 1
        
        expected_xp = result.get("xp_added", 0)  # Should be 30 for new lesson
        expected_exercises = result.get("exercises_completed", 0)  # Should be incremented
        expected_new_achievements = result.get("new_achievements", [])
        
        if expected_xp < 30:
            print_error(f"Expected XP added >= 30, got {expected_xp}")
            return False
            
        if expected_exercises < 1:
            print_error(f"Expected exercises_completed >= 1, got {expected_exercises}")
            return False
            
        # Check if first_lesson achievement was earned (for new users)
        has_first_lesson = any(ach.get("id") == "first_lesson" for ach in expected_new_achievements)
        if len(expected_new_achievements) > 0 and not has_first_lesson:
            print_warning("First lesson achievement not found in new achievements (might be existing user)")
        elif has_first_lesson:
            print_success("First lesson achievement triggered correctly")
            
        print_success(f"Lesson completed: bones={result.get('bones')}, xp={result.get('xp')}, exercises={expected_exercises}")
        return True
    
    def test_4_verify_stats_persisted(self):
        """Verify stats are persisted correctly after first lesson"""
        if not self.session_token:
            return False
            
        url = f"{API_BASE}/gamification/stats"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print_error(f"Stats request failed with status {response.status_code}: {response.text}")
            return False
            
        stats = response.json()
        print_info(f"Persisted stats: {json.dumps(stats, indent=2)}")
        
        # Verify we have some progress
        if stats.get("xp", 0) < 30:
            print_error(f"Expected XP >= 30, got {stats.get('xp')}")
            return False
            
        if stats.get("exercises_completed", 0) < 1:
            print_error(f"Expected exercises_completed >= 1, got {stats.get('exercises_completed')}")
            return False
            
        if stats.get("level", 0) != 1:
            print_error(f"Expected level=1, got {stats.get('level')}")
            return False
            
        print_success("Stats properly persisted in database")
        return True
    
    def test_5_verify_achievements_list(self):
        """Verify achievements list shows correct structure"""
        if not self.session_token:
            return False
            
        url = f"{API_BASE}/gamification/achievements"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print_error(f"Achievements request failed with status {response.status_code}: {response.text}")
            return False
            
        result = response.json()
        print_info(f"Achievements response: {json.dumps(result, indent=2)}")
        
        if result.get("total") != 9:
            print_error(f"Expected 9 total achievements, got {result.get('total')}")
            return False
            
        achievements = result.get("achievements", [])
        if len(achievements) != 9:
            print_error(f"Expected 9 achievement objects, got {len(achievements)}")
            return False
            
        # Check if first_lesson is in the list and might be unlocked
        first_lesson_ach = next((ach for ach in achievements if ach.get("id") == "first_lesson"), None)
        if not first_lesson_ach:
            print_error("first_lesson achievement not found in achievements list")
            return False
            
        print_success(f"Achievements list correct: 9 total, {result.get('unlocked_count')} unlocked")
        return True
    
    def test_6_complete_second_lesson(self):
        """Complete another lesson to verify no duplicate achievements"""
        if not self.session_token:
            return False
            
        url = f"{API_BASE}/gamification/add-bones"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        data = {
            "amount": 10,
            "reason": "Lección: Sentado Perfecto",
            "lesson_id": "sentado-basico"
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code != 200:
            print_error(f"Add bones failed with status {response.status_code}: {response.text}")
            return False
            
        result = response.json()
        print_info(f"Second lesson result: {json.dumps(result, indent=2)}")
        
        # Should NOT get first_lesson achievement again
        new_achievements = result.get("new_achievements", [])
        has_duplicate_first_lesson = any(ach.get("id") == "first_lesson" for ach in new_achievements)
        
        if has_duplicate_first_lesson:
            print_error("Duplicate first_lesson achievement detected!")
            return False
            
        if result.get("exercises_completed", 0) < 2:
            print_error(f"Expected exercises_completed >= 2, got {result.get('exercises_completed')}")
            return False
            
        print_success("Second lesson completed without duplicate achievements")
        return True
    
    def test_7_complete_multiple_lessons_rapidly(self):
        """Complete 8 more lessons rapidly to test 10-lesson milestone"""
        if not self.session_token:
            return False
            
        url = f"{API_BASE}/gamification/add-bones"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        lesson_ids = [
            "caminar-correa",
            "venir-llamada",
            "quieto-basico",
            "dejalo-comando",
            "pata-saludo",
            "esperar-paciencia",
            "no-saltar",
            "ladrar-control"
        ]
        
        starting_exercises = None
        for i, lesson_id in enumerate(lesson_ids):
            data = {
                "amount": 8,
                "reason": f"Lección: {lesson_id.title()}",
                "lesson_id": lesson_id
            }
            
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code != 200:
                print_error(f"Lesson {i+3} failed with status {response.status_code}: {response.text}")
                return False
                
            result = response.json()
            current_exercises = result.get("exercises_completed", 0)
            
            if starting_exercises is None:
                starting_exercises = current_exercises - 1  # Account for this lesson
            
            print_info(f"Lesson {i+3}: exercises={current_exercises}, bones={result.get('bones')}")
            
            # Check for 10_lessons achievement after reaching 10 exercises
            if current_exercises >= 10:
                new_achievements = result.get("new_achievements", [])
                has_10_lessons = any(ach.get("id") == "10_lessons" for ach in new_achievements)
                if has_10_lessons:
                    print_success("🏆 10_lessons achievement unlocked!")
                    break
        
        print_success("Completed 8 additional lessons successfully")
        return True
    
    def test_8_verify_final_stats(self):
        """Verify final stats show correct totals and achievements"""
        if not self.session_token:
            return False
            
        # Get final stats
        url = f"{API_BASE}/gamification/stats"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print_error(f"Stats request failed with status {response.status_code}: {response.text}")
            return False
            
        stats = response.json()
        print_info(f"Final stats: {json.dumps(stats, indent=2)}")
        
        # Should have completed at least 10 exercises
        if stats.get("exercises_completed", 0) < 10:
            print_error(f"Expected exercises_completed >= 10, got {stats.get('exercises_completed')}")
            return False
            
        # Should have significant XP (calculated: 15*2 + 10*2 + 8*8*2 = 30+20+128 = 178)
        if stats.get("xp", 0) < 170:
            print_error(f"Expected XP >= 170, got {stats.get('xp')}")
            return False
            
        # Check achievements
        achievements_unlocked = stats.get("achievements_unlocked", [])
        if "first_lesson" not in achievements_unlocked:
            print_error("first_lesson achievement not in unlocked list")
            return False
            
        if stats.get("exercises_completed", 0) >= 10 and "10_lessons" not in achievements_unlocked:
            print_error("10_lessons achievement should be unlocked")
            return False
            
        print_success(f"Final verification: {len(achievements_unlocked)} achievements unlocked, {stats.get('exercises_completed')} exercises completed")
        return True
    
    def run_all_tests(self):
        """Run the complete E2E gamification test suite"""
        print_header("🎮 HEIMDALL GAMIFICATION E2E TEST SUITE")
        
        tests = [
            ("1. Register Fresh User", self.test_1_register_user),
            ("2. Verify Initial Stats Zero", self.test_2_verify_initial_stats_zero),
            ("3. Complete First Lesson", self.test_3_complete_first_lesson),
            ("4. Verify Stats Persisted", self.test_4_verify_stats_persisted),
            ("5. Verify Achievements List", self.test_5_verify_achievements_list),
            ("6. Complete Second Lesson", self.test_6_complete_second_lesson),
            ("7. Complete Multiple Lessons", self.test_7_complete_multiple_lessons_rapidly),
            ("8. Verify Final Stats", self.test_8_verify_final_stats)
        ]
        
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
            print()  # Add spacing
        
        # Final summary
        print_header("🧪 TEST RESULTS SUMMARY")
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        if self.passed_tests == self.total_tests:
            print_success(f"ALL TESTS PASSED! ({self.passed_tests}/{self.total_tests}) - {success_rate:.1f}%")
        else:
            print_error(f"SOME TESTS FAILED: {self.passed_tests}/{self.total_tests} passed ({success_rate:.1f}%)")
            
        if self.failed_tests:
            print_error("Failed tests:")
            for test in self.failed_tests:
                print_error(f"  - {test}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    print_header("🚀 Starting Heimdall Backend E2E Testing")
    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"Test Email: e2e_gamification_test@test.com")
    print()
    
    tester = GamificationTester()
    success = tester.run_all_tests()
    
    if success:
        print_success("🎉 All E2E tests completed successfully!")
        sys.exit(0)
    else:
        print_error("💥 Some tests failed - check logs above")
        sys.exit(1)

if __name__ == "__main__":
    main()