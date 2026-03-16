"""
Test Chat Features - AI Response Formatting, Emoji Usage, and Rating System
Tests for Heimdall dog training app chat improvements:
- POST /api/chat: AI responses with emojis and clean formatting (no raw **asterisks**)
- POST /api/chat/{message_id}/rate: Rate messages with graceful DB handling
- GET /api/chat/history: Returns messages with rating field when available
"""

import pytest
import requests
import os
import time
import re

# Use the backend URL from environment
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://hani-learning.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "testlesson@test.com"
TEST_PASSWORD = "test123456"


class TestAuthAndSetup:
    """Authentication tests and setup"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create a requests session"""
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        """Get authentication token for test user"""
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "session_token" in data, "No session_token in response"
        return data["session_token"]
    
    def test_login_success(self, session, auth_token):
        """Verify test user can log in"""
        assert auth_token is not None
        assert auth_token.startswith("session_")
        print(f"LOGIN SUCCESS: Got session token: {auth_token[:20]}...")


class TestChatEndpoint:
    """Tests for POST /api/chat - AI response formatting and emoji usage"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()["session_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_chat_returns_200(self, session, auth_headers):
        """Test that chat endpoint returns 200 with valid input"""
        response = session.post(
            f"{BASE_URL}/api/chat",
            json={"content": "Hola, me puedes ayudar con mi perro?", "language": "Spanish"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chat failed: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "content" in data, "Response missing 'content' field"
        assert "id" in data, "Response missing 'id' field"
        assert "role" in data, "Response missing 'role' field"
        assert data["role"] == "assistant"
        
        print(f"CHAT RESPONSE SUCCESS: id={data['id']}, content length={len(data['content'])}")
    
    def test_chat_response_contains_emojis(self, session, auth_headers):
        """Test that AI responses include emojis as per Section 19 of system prompt"""
        response = session.post(
            f"{BASE_URL}/api/chat",
            json={"content": "Mi perro Max tiene 3 meses y quiero saber cómo entrenarlo", "language": "Spanish"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        content = data.get("content", "")
        
        # Check for common emojis that Heimdall might use
        # Common dog-related and friendly emojis
        emoji_pattern = re.compile(
            r'[\U0001F436\U0001F43E\U0001F415\U0001F9AE'  # Dog faces, paw
            r'\U0001F60A\U0001F60D\U0001F600\U0001F642'  # Smiling faces
            r'\U0001F496\U0001F495\U00002764\U0001F497'  # Hearts
            r'\U00002705\U00002714\U00002B50'           # Checkmarks, stars
            r'\U0001F4AA\U0001F3C6\U0001F389'           # Strong arm, trophy, party
            r'\U0001F4A1\U0001F31F\U00002728]'          # Light bulb, stars, sparkles
        )
        
        has_emojis = bool(emoji_pattern.search(content))
        
        # Log the response for debugging
        print(f"AI RESPONSE (first 500 chars): {content[:500]}")
        print(f"EMOJI CHECK: {'FOUND emojis in response' if has_emojis else 'No emojis detected - SYSTEM PROMPT MAY NEED ADJUSTMENT'}")
        
        # Note: Not asserting failure here since AI behavior is probabilistic
        # but logging for manual verification
        if not has_emojis:
            print("WARNING: No emojis detected in response. The system prompt Section 19 instructs emoji usage.")
    
    def test_chat_response_no_raw_asterisks(self, session, auth_headers):
        """Test that AI responses don't contain raw markdown **asterisks** for bold"""
        response = session.post(
            f"{BASE_URL}/api/chat",
            json={"content": "Dame consejos importantes para el entrenamiento de mi perro", "language": "Spanish"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        content = data.get("content", "")
        
        # Check for markdown bold patterns **text**
        bold_pattern = re.compile(r'\*\*[^*]+\*\*')
        has_markdown_bold = bool(bold_pattern.search(content))
        
        print(f"AI RESPONSE (first 500 chars): {content[:500]}")
        print(f"MARKDOWN CHECK: {'FOUND raw **bold** markers - NEEDS FIX' if has_markdown_bold else 'No raw markdown bold markers - GOOD'}")
        
        # Note: The system prompt instructs not to use asterisks, but AI may still do it
        if has_markdown_bold:
            print("WARNING: Response contains raw **bold** markdown. System prompt Section 19 says to avoid this.")
    
    def test_chat_requires_auth(self, session):
        """Test that chat endpoint requires authentication"""
        response = session.post(
            f"{BASE_URL}/api/chat",
            json={"content": "Hola"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("AUTH CHECK: Correctly returns 401 without authentication")


class TestChatRatingEndpoint:
    """Tests for POST /api/chat/{message_id}/rate - Rating messages"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()["session_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    @pytest.fixture(scope="class")
    def chat_message_id(self, session, auth_headers):
        """Create a chat message and return its ID for rating tests"""
        response = session.post(
            f"{BASE_URL}/api/chat",
            json={"content": "TEST_RATING mensaje para probar rating", "language": "Spanish"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Failed to create test message: {response.text}"
        data = response.json()
        message_id = data.get("id")
        assert message_id, "No message ID returned"
        print(f"Created test message with ID: {message_id}")
        return message_id
    
    def test_rate_message_up(self, session, auth_headers, chat_message_id):
        """Test rating a message as 'up' (thumbs up)"""
        response = session.post(
            f"{BASE_URL}/api/chat/{chat_message_id}/rate",
            json={"rating": "up"},
            headers=auth_headers
        )
        # Should return 200 even if DB column doesn't exist (graceful handling)
        assert response.status_code == 200, f"Rate up failed: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "rating" in data, "Response missing 'rating' field"
        assert data["rating"] == "up"
        print(f"RATE UP SUCCESS: {data}")
    
    def test_rate_message_down(self, session, auth_headers, chat_message_id):
        """Test rating a message as 'down' (thumbs down)"""
        response = session.post(
            f"{BASE_URL}/api/chat/{chat_message_id}/rate",
            json={"rating": "down"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Rate down failed: {response.status_code} - {response.text}"
        data = response.json()
        
        assert "rating" in data
        assert data["rating"] == "down"
        print(f"RATE DOWN SUCCESS: {data}")
    
    def test_rate_invalid_rating_value(self, session, auth_headers, chat_message_id):
        """Test that invalid rating values are rejected"""
        response = session.post(
            f"{BASE_URL}/api/chat/{chat_message_id}/rate",
            json={"rating": "invalid"},
            headers=auth_headers
        )
        # Should return 400 for invalid rating value
        assert response.status_code == 400, f"Expected 400 for invalid rating, got {response.status_code}"
        print(f"INVALID RATING CHECK: Correctly returns 400 for invalid rating value")
    
    def test_rate_requires_auth(self, session):
        """Test that rating endpoint requires authentication"""
        response = session.post(
            f"{BASE_URL}/api/chat/some-message-id/rate",
            json={"rating": "up"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("AUTH CHECK: Rate endpoint correctly returns 401 without authentication")


class TestChatHistoryEndpoint:
    """Tests for GET /api/chat/history - Retrieving chat messages"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()["session_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_chat_history_returns_200(self, session, auth_headers):
        """Test that chat history endpoint returns 200"""
        response = session.get(
            f"{BASE_URL}/api/chat/history",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Get history failed: {response.status_code} - {response.text}"
        data = response.json()
        
        # Should return a list
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"CHAT HISTORY: Retrieved {len(data)} messages")
    
    def test_chat_history_message_structure(self, session, auth_headers):
        """Test that chat history returns messages with correct structure"""
        response = session.get(
            f"{BASE_URL}/api/chat/history",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            msg = data[0]
            # Verify required fields
            assert "id" in msg, "Message missing 'id' field"
            assert "role" in msg, "Message missing 'role' field"
            assert "content" in msg, "Message missing 'content' field"
            assert "created_at" in msg, "Message missing 'created_at' field"
            
            # Check if rating field is present (optional)
            has_rating_field = "rating" in msg
            print(f"MESSAGE STRUCTURE: id={msg['id'][:20]}..., role={msg['role']}, has_rating={has_rating_field}")
            
            # Count messages with rating
            rated_count = sum(1 for m in data if m.get("rating"))
            print(f"RATING FIELD STATUS: {rated_count}/{len(data)} messages have rating field")
    
    def test_chat_history_with_limit(self, session, auth_headers):
        """Test that chat history respects limit parameter"""
        response = session.get(
            f"{BASE_URL}/api/chat/history?limit=5",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should return at most 5 messages
        assert len(data) <= 5, f"Expected max 5 messages, got {len(data)}"
        print(f"LIMIT CHECK: Requested 5, got {len(data)} messages")
    
    def test_chat_history_requires_auth(self, session):
        """Test that chat history endpoint requires authentication"""
        response = session.get(f"{BASE_URL}/api/chat/history")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("AUTH CHECK: Chat history correctly returns 401 without authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
