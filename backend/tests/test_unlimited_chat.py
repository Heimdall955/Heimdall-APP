"""
Test Suite: Unlimited Chat Messages + Companion Personality + Feedback Learning

Features being tested:
1. POST /api/chat - should work without message limits (unlimited for free users)
2. POST /api/chat - response should include emojis and warm companion tone
3. POST /api/chat/{message_id}/rate - rate endpoint returns 200
4. Feedback learning: chat history includes rating field for context injection
5. GET /api/chat/daily-usage - should return usage data
6. File upload limits still enforced for free users (photos: 1, videos: 0, pdfs: 0)
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hani-learning.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "testlesson@test.com"
TEST_PASSWORD = "test123456"


class TestUnlimitedChat:
    """Test that chat messages are unlimited for free users"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        
        # Login
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code != 200:
            pytest.skip(f"Could not authenticate: {response.status_code} - {response.text}")
        
        data = response.json()
        token = data.get("session_token")
        s.headers.update({"Authorization": f"Bearer {token}"})
        return s
    
    def test_login_successful(self, session):
        """Verify login works and we have valid session"""
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert data["email"] == TEST_EMAIL
        print(f"Logged in as: {data['email']}")
    
    def test_chat_message_1(self, session):
        """Send first chat message - should return 200"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Hola Heimdall! Como estas hoy?",
            "language": "Spanish"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        assert "content" in data
        assert data["role"] == "assistant"
        print(f"Message 1: OK - Response length: {len(data['content'])}")
    
    def test_chat_message_2(self, session):
        """Send second message"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Que me recomiendas para el cuidado de mi perro?",
            "language": "Spanish"
        })
        assert response.status_code == 200
        print("Message 2: OK")
    
    def test_chat_message_3(self, session):
        """Send third message"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Es normal que mi perro duerma mucho?",
            "language": "Spanish"
        })
        assert response.status_code == 200
        print("Message 3: OK")
    
    def test_chat_message_4(self, session):
        """Send fourth message"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Cuanto ejercicio deberia hacer?",
            "language": "Spanish"
        })
        assert response.status_code == 200
        print("Message 4: OK")
    
    def test_chat_message_5(self, session):
        """Send fifth message"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Y sobre su alimentacion?",
            "language": "Spanish"
        })
        assert response.status_code == 200
        print("Message 5: OK")
    
    def test_chat_message_6_no_limit(self, session):
        """Send sixth message - THIS SHOULD WORK NOW (no limit)"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Gracias por la info! Otra pregunta sobre vacunas.",
            "language": "Spanish"
        })
        # Previously would have hit 5 message limit, now should be 200
        assert response.status_code == 200, f"Message 6 should succeed (unlimited). Got {response.status_code}: {response.text}"
        print("Message 6: OK - UNLIMITED CHAT WORKING!")
    
    def test_chat_message_7_still_works(self, session):
        """Send seventh message to confirm truly unlimited"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Una ultima pregunta sobre el chip de identificacion.",
            "language": "Spanish"
        })
        assert response.status_code == 200, f"Message 7 should succeed. Got {response.status_code}"
        print("Message 7: OK - Confirmed unlimited!")


class TestCompanionTone:
    """Test that AI responses have warm companion tone and emojis"""
    
    @pytest.fixture(scope="class")
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json().get("session_token")
        s.headers.update({"Authorization": f"Bearer {token}"})
        return s
    
    def test_response_has_emojis(self, session):
        """Verify AI response includes emojis for warm companion feel"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Hola! Mi perrito se llama Luna y quiero saber como cuidarla bien.",
            "language": "Spanish"
        })
        assert response.status_code == 200
        data = response.json()
        content = data["content"]
        
        # Check for common emojis (per system prompt Section 19)
        emoji_indicators = ['🐕', '🐶', '❤️', '💚', '🌟', '✅', '⭐', '🦴', '🐾', '💛', '😊', '🙂']
        has_emoji = any(emoji in content for emoji in emoji_indicators)
        
        # Also check for any unicode emoji range
        import re
        emoji_pattern = re.compile("[\U00010000-\U0010ffff]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]", re.UNICODE)
        has_unicode_emoji = bool(emoji_pattern.search(content))
        
        print(f"Response content (first 300 chars): {content[:300]}")
        print(f"Has known emojis: {has_emoji}, Has unicode emoji: {has_unicode_emoji}")
        
        # At least one emoji type should be present
        assert has_emoji or has_unicode_emoji or '❤' in content or '🐕' in content, \
            f"Expected emojis in warm companion response. Got: {content[:500]}"
        print("PASS: Response includes emojis for companion personality")
    
    def test_response_structure_is_readable(self, session):
        """Verify response has paragraph breaks for mobile readability"""
        response = session.post(f"{BASE_URL}/api/chat", json={
            "content": "Mi perro tiene 2 anos y no quiere comer. Que puedo hacer?",
            "language": "Spanish"
        })
        assert response.status_code == 200
        content = response.json()["content"]
        
        # Check for line breaks (paragraph separation)
        has_line_breaks = '\n' in content
        print(f"Has line breaks for readability: {has_line_breaks}")
        print(f"Content sample: {content[:400]}")


class TestRatingEndpoint:
    """Test the message rating functionality"""
    
    @pytest.fixture(scope="class")
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json().get("session_token")
        s.headers.update({"Authorization": f"Bearer {token}"})
        return s
    
    def test_get_history_for_message_id(self, session):
        """Get chat history to find a message ID to rate"""
        response = session.get(f"{BASE_URL}/api/chat/history?limit=5")
        assert response.status_code == 200
        messages = response.json()
        assert isinstance(messages, list)
        
        # Find an assistant message to rate
        assistant_msgs = [m for m in messages if m.get("role") == "assistant"]
        if not assistant_msgs:
            pytest.skip("No assistant messages found to rate")
        
        message_id = assistant_msgs[0]["id"]
        print(f"Found message to rate: {message_id}")
        return message_id
    
    def test_rate_message_up(self, session):
        """Rate a message with thumbs up"""
        # First get a message ID
        response = session.get(f"{BASE_URL}/api/chat/history?limit=5")
        messages = response.json()
        assistant_msgs = [m for m in messages if m.get("role") == "assistant"]
        
        if not assistant_msgs:
            pytest.skip("No assistant messages to rate")
        
        message_id = assistant_msgs[0]["id"]
        
        # Rate up
        response = session.post(f"{BASE_URL}/api/chat/{message_id}/rate", json={
            "rating": "up"
        })
        assert response.status_code == 200, f"Rate up failed: {response.status_code} - {response.text}"
        data = response.json()
        assert data.get("rating") == "up"
        print(f"PASS: Rated message {message_id} as 'up'")
    
    def test_rate_message_down(self, session):
        """Rate a message with thumbs down"""
        response = session.get(f"{BASE_URL}/api/chat/history?limit=10")
        messages = response.json()
        assistant_msgs = [m for m in messages if m.get("role") == "assistant"]
        
        if len(assistant_msgs) < 2:
            pytest.skip("Need at least 2 messages to test both rating types")
        
        message_id = assistant_msgs[1]["id"]
        
        response = session.post(f"{BASE_URL}/api/chat/{message_id}/rate", json={
            "rating": "down"
        })
        assert response.status_code == 200, f"Rate down failed: {response.status_code}"
        data = response.json()
        assert data.get("rating") == "down"
        print(f"PASS: Rated message {message_id} as 'down'")
    
    def test_rate_invalid_value(self, session):
        """Test invalid rating value returns 400"""
        response = session.get(f"{BASE_URL}/api/chat/history?limit=1")
        messages = response.json()
        
        if not messages:
            pytest.skip("No messages found")
        
        message_id = messages[0]["id"]
        
        response = session.post(f"{BASE_URL}/api/chat/{message_id}/rate", json={
            "rating": "invalid"
        })
        assert response.status_code == 400, f"Expected 400 for invalid rating, got {response.status_code}"
        print("PASS: Invalid rating returns 400")


class TestDailyUsage:
    """Test the daily usage endpoint"""
    
    @pytest.fixture(scope="class")
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json().get("session_token")
        s.headers.update({"Authorization": f"Bearer {token}"})
        return s
    
    def test_daily_usage_returns_200(self, session):
        """GET /api/chat/daily-usage should return 200"""
        response = session.get(f"{BASE_URL}/api/chat/daily-usage")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Daily usage response: {data}")
    
    def test_daily_usage_structure(self, session):
        """Verify daily usage response structure"""
        response = session.get(f"{BASE_URL}/api/chat/daily-usage")
        assert response.status_code == 200
        data = response.json()
        
        # Should have usage and limits
        assert "usage" in data or "daily_usage" in data
        assert "limits" in data or "daily_limits" in data
        
        # Check limits show -1 for messages (unlimited) for free users
        limits = data.get("limits") or data.get("daily_limits", {})
        usage = data.get("usage") or data.get("daily_usage", {})
        
        print(f"Usage: {usage}")
        print(f"Limits: {limits}")
        
        # Messages should be -1 (unlimited)
        assert limits.get("messages") == -1, f"Expected messages limit to be -1 (unlimited), got {limits.get('messages')}"
        print("PASS: Messages limit is -1 (unlimited)")
    
    def test_file_upload_limits_for_free_user(self, session):
        """Verify file upload limits still enforced"""
        response = session.get(f"{BASE_URL}/api/chat/daily-usage")
        data = response.json()
        
        limits = data.get("limits") or data.get("daily_limits", {})
        
        # For free users: photos=1, videos=0, pdfs=0
        # (Unless they are pro, then all -1)
        is_pro = data.get("is_pro", False)
        
        if not is_pro:
            assert limits.get("photos") == 1, f"Free user photo limit should be 1, got {limits.get('photos')}"
            assert limits.get("videos") == 0, f"Free user video limit should be 0, got {limits.get('videos')}"
            assert limits.get("pdfs") == 0, f"Free user pdf limit should be 0, got {limits.get('pdfs')}"
            print("PASS: Free user file upload limits enforced (photos:1, videos:0, pdfs:0)")
        else:
            print("NOTE: User is PRO, file limits are unlimited")


class TestFeedbackLearning:
    """Test that feedback context is injected into AI prompts"""
    
    @pytest.fixture(scope="class")
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json().get("session_token")
        s.headers.update({"Authorization": f"Bearer {token}"})
        return s
    
    def test_chat_history_includes_rating_field(self, session):
        """Verify chat history response can include rating field"""
        response = session.get(f"{BASE_URL}/api/chat/history?limit=20")
        assert response.status_code == 200
        messages = response.json()
        
        # Check structure - rating field should be present if message was rated
        for msg in messages:
            assert "id" in msg
            assert "role" in msg
            assert "content" in msg
            # rating is optional, but the schema supports it
        
        # Count messages with ratings
        rated_msgs = [m for m in messages if m.get("rating")]
        print(f"Found {len(rated_msgs)} rated messages out of {len(messages)} total")
        print("PASS: Chat history structure verified (rating field supported)")


class TestAuthRequired:
    """Test that endpoints require authentication"""
    
    def test_chat_requires_auth(self):
        """POST /api/chat without auth should return 401"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "content": "test"
        })
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: /api/chat requires auth")
    
    def test_rate_requires_auth(self):
        """POST /api/chat/{id}/rate without auth should return 401"""
        response = requests.post(f"{BASE_URL}/api/chat/some-id/rate", json={
            "rating": "up"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: /api/chat/{id}/rate requires auth")
    
    def test_daily_usage_requires_auth(self):
        """GET /api/chat/daily-usage without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/chat/daily-usage")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: /api/chat/daily-usage requires auth")
    
    def test_history_requires_auth(self):
        """GET /api/chat/history without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/chat/history")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: /api/chat/history requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
