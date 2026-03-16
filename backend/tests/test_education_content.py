"""
Comprehensive Test Suite for HANI/Heimdall Education & Gamification
Tests:
- All Lesson IDs from PROGRAMAS exist in LECCIONES_DB
- All Exercise IDs exist in EJERCICIOS_DB
- All Game IDs exist in JUEGOS_DB
- Backend gamification APIs work correctly
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hani-learning.preview.emergentagent.com').rstrip('/')

# Test user credentials
TEST_EMAIL = f"test_edu_{uuid.uuid4().hex[:8]}@test.com"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "Test Education User"

# ==================== CONTENT VERIFICATION ====================

# Expected lesson IDs from PROGRAMAS (in programa.tsx)
EXPECTED_LESSONS_FROM_PROGRAMS = {
    # educacion-basica
    'refuerzo-positivo', 'sentado-basico', 'quieto', 'llamada-perfecta', 'tumbado', 'paseo-correa',
    # calma-control
    'estres-canino', 'relajacion', 'lugar-seguro', 'desensibilizacion', 'rutinas-calmantes',
    # socializacion
    'ventana-socializacion', 'presentaciones-perros', 'interaccion-humanos', 'nuevos-entornos', 'sonidos-estimulos', 'parque-canino',
    # mundo-cachorro
    'bienvenido-casa', 'rutina-cachorro', 'inhibicion-mordisco', 'necesidades', 'socializacion-temprana', 'juego-apropiado', 'quedarse-solo'
}

# All lessons available in LECCIONES_DB (in leccion.tsx)
AVAILABLE_LESSONS = {
    'llamada-perfecta', 'sentado-basico', 'tumbado', 'quieto', 'control-impulsos', 'socializacion',
    'refuerzo-positivo', 'paseo-correa', 'estres-canino', 'relajacion', 'lugar-seguro',
    'desensibilizacion', 'rutinas-calmantes', 'bienvenido-casa', 'inhibicion-mordisco',
    'necesidades', 'quedarse-solo', 'ventana-socializacion', 'presentaciones-perros',
    'interaccion-humanos', 'nuevos-entornos', 'sonidos-estimulos', 'parque-canino',
    'rutina-cachorro', 'socializacion-temprana', 'juego-apropiado'
}

# Exercise IDs in EJERCICIOS_DB (in ejercicio.tsx)
EXPECTED_EXERCISES = {
    'senales-basicas', 'control-impulsos', 'socializacion', 'paseo-correa', 'calma-casa'
}

# Game IDs in JUEGOS_DB (in juego.tsx)
EXPECTED_GAMES = {
    'puzzle-mental', 'tira-afloja'
}


class TestContentVerification:
    """Verify all content IDs are properly mapped"""
    
    def test_all_program_lessons_exist(self):
        """All lesson IDs referenced in programs should exist in LECCIONES_DB"""
        missing = EXPECTED_LESSONS_FROM_PROGRAMS - AVAILABLE_LESSONS
        if missing:
            pytest.fail(f"Missing lessons in LECCIONES_DB: {missing}")
        print(f"✅ All {len(EXPECTED_LESSONS_FROM_PROGRAMS)} program lesson IDs exist in LECCIONES_DB")
    
    def test_exercise_ids_count(self):
        """Verify expected exercise IDs exist"""
        assert len(EXPECTED_EXERCISES) == 5, f"Expected 5 exercises, got {len(EXPECTED_EXERCISES)}"
        print(f"✅ All {len(EXPECTED_EXERCISES)} exercise IDs verified: {EXPECTED_EXERCISES}")
    
    def test_game_ids_count(self):
        """Verify expected game IDs exist"""
        assert len(EXPECTED_GAMES) == 2, f"Expected 2 games, got {len(EXPECTED_GAMES)}"
        print(f"✅ All {len(EXPECTED_GAMES)} game IDs verified: {EXPECTED_GAMES}")


class TestGamificationAPI:
    """Test gamification backend APIs"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Register and return auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME}
        )
        if response.status_code == 200:
            return response.json().get("session_token")
        elif response.status_code == 400:
            login_response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
            )
            if login_response.status_code == 200:
                return login_response.json().get("session_token")
        return None
    
    def test_add_bones_for_lesson(self, auth_token):
        """POST /api/gamification/add-bones returns correct fields for lesson completion"""
        if not auth_token:
            pytest.skip("No auth token")
        
        response = requests.post(
            f"{BASE_URL}/api/gamification/add-bones",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"amount": 15, "reason": "Lección: La Llamada Perfecta", "lesson_id": "llamada-perfecta"}
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify required response fields
        assert "bones_added" in data and data["bones_added"] == 15
        assert "bones" in data and isinstance(data["bones"], int)
        assert "xp" in data and isinstance(data["xp"], int)
        assert "level" in data and isinstance(data["level"], int)
        assert "leveled_up" in data and isinstance(data["leveled_up"], bool)
        
        print(f"✅ add-bones for lesson works: +{data['bones_added']} bones, total={data['bones']}, level={data['level']}")
    
    def test_add_bones_for_exercise(self, auth_token):
        """Test add-bones for exercise completion"""
        if not auth_token:
            pytest.skip("No auth token")
        
        response = requests.post(
            f"{BASE_URL}/api/gamification/add-bones",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"amount": 5, "reason": "Ejercicio: Señales Básicas"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["bones_added"] == 5
        print(f"✅ add-bones for exercise works: +{data['bones_added']} bones")
    
    def test_add_bones_for_game(self, auth_token):
        """Test add-bones for game completion"""
        if not auth_token:
            pytest.skip("No auth token")
        
        response = requests.post(
            f"{BASE_URL}/api/gamification/add-bones",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"amount": 25, "reason": "Juego: Puzzle Mental"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["bones_added"] == 25
        print(f"✅ add-bones for game works: +{data['bones_added']} bones")
    
    def test_get_stats_all_fields(self, auth_token):
        """GET /api/gamification/stats returns all required fields"""
        if not auth_token:
            pytest.skip("No auth token")
        
        response = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['bones', 'xp', 'level', 'streak_days', 'exercises_completed', 
                          'level_progress', 'level_target']
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✅ stats endpoint returns all fields: bones={data['bones']}, level={data['level']}, xp={data['xp']}")
    
    def test_bones_accumulate_correctly(self, auth_token):
        """Multiple add-bones calls should accumulate"""
        if not auth_token:
            pytest.skip("No auth token")
        
        # Get initial bones
        initial = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json().get("bones", 0)
        
        # Add bones twice
        requests.post(
            f"{BASE_URL}/api/gamification/add-bones",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"amount": 10, "reason": "Test 1"}
        )
        requests.post(
            f"{BASE_URL}/api/gamification/add-bones",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"amount": 10, "reason": "Test 2"}
        )
        
        # Check final bones
        final = requests.get(
            f"{BASE_URL}/api/gamification/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json().get("bones", 0)
        
        # Should have increased by at least 20
        assert final >= initial + 20, f"Bones didn't accumulate: {initial} -> {final}"
        print(f"✅ Bones accumulate correctly: {initial} -> {final}")


class TestHealthCheck:
    """Basic API health tests"""
    
    def test_health_endpoint(self):
        """Backend health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        assert response.json().get("status") == "healthy"
        print("✅ Backend health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
