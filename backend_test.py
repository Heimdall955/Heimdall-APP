#!/usr/bin/env python3

import asyncio
import io
import struct
import zlib
import os
import tempfile
import requests
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import time

# Test Configuration
BASE_URL = "https://hani-achievements-ui.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session_token = None
        self.user_id = None
        self.test_results = []
    
    def log_test(self, test_name, success, details="", error=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": str(error) if error else None
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"    Details: {details}")
        if error:
            print(f"    Error: {error}")
        print()

    def create_test_png(self):
        """Create a minimal valid PNG image (1x1 pixel)"""
        # PNG signature
        png_signature = b'\x89PNG\r\n\x1a\n'
        
        # IHDR chunk (image header)
        width = height = 1
        bit_depth = 8
        color_type = 2  # RGB
        compression = filter_method = interlace = 0
        
        ihdr_data = struct.pack('>2I5B', width, height, bit_depth, color_type, 
                               compression, filter_method, interlace)
        ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
        ihdr_chunk = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
        
        # IDAT chunk (image data) - single red pixel
        pixel_data = b'\x00\xff\x00\x00'  # Filter byte + RGB pixel (red)
        compressed_data = zlib.compress(pixel_data)
        idat_crc = zlib.crc32(b'IDAT' + compressed_data) & 0xffffffff
        idat_chunk = struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)
        
        # IEND chunk (end of image)
        iend_crc = zlib.crc32(b'IEND') & 0xffffffff
        iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
        
        return png_signature + ihdr_chunk + idat_chunk + iend_chunk

    def create_test_pdf(self):
        """Create a simple PDF with blood test data"""
        buffer = io.BytesIO()
        
        # Create PDF with blood test results
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, height - 100, "ANÁLISIS DE SANGRE - LABORATORIO VETERINARIO")
        
        # Patient info
        p.setFont("Helvetica", 12)
        y_pos = height - 150
        p.drawString(100, y_pos, "Paciente: Max (Perro)")
        p.drawString(100, y_pos - 20, "Edad: 3 años")
        p.drawString(100, y_pos - 40, "Raza: Golden Retriever")
        p.drawString(100, y_pos - 60, "Fecha: 15/12/2024")
        
        # Test results
        y_pos = height - 250
        p.setFont("Helvetica-Bold", 14)
        p.drawString(100, y_pos, "RESULTADOS:")
        
        y_pos -= 30
        p.setFont("Helvetica", 11)
        results = [
            ("Hemoglobina", "15.2 g/dL", "(12.0-18.0)", "Normal"),
            ("Hematocrito", "45%", "(37-55%)", "Normal"),
            ("Leucocitos", "8.500/µL", "(6.000-17.000)", "Normal"),
            ("Neutrófilos", "65%", "(60-77%)", "Normal"),
            ("Linfocitos", "28%", "(12-30%)", "Normal"),
            ("Plaquetas", "350.000/µL", "(200.000-500.000)", "Normal"),
            ("Glucosa", "95 mg/dL", "(70-110)", "Normal"),
            ("Creatinina", "1.1 mg/dL", "(0.5-1.8)", "Normal"),
            ("ALT", "32 U/L", "(10-100)", "Normal"),
            ("Proteínas totales", "6.8 g/dL", "(5.4-7.1)", "Normal")
        ]
        
        for param, value, range_val, status in results:
            p.drawString(100, y_pos, f"{param}:")
            p.drawString(250, y_pos, value)
            p.drawString(350, y_pos, range_val)
            p.drawString(450, y_pos, status)
            y_pos -= 20
        
        # Conclusion
        y_pos -= 30
        p.setFont("Helvetica-Bold", 12)
        p.drawString(100, y_pos, "CONCLUSIÓN:")
        y_pos -= 20
        p.setFont("Helvetica", 11)
        p.drawString(100, y_pos, "Todos los parámetros están dentro de los valores normales.")
        p.drawString(100, y_pos - 15, "El animal presenta un estado de salud óptimo.")
        
        p.save()
        buffer.seek(0)
        return buffer.getvalue()

    def create_invalid_text_file(self):
        """Create a text file to test invalid file type"""
        return b"This is a text file, not an image."

    async def test_user_registration(self):
        """Test 1: Register a user"""
        try:
            test_email = f"upload_e2e@test.com"
            response = requests.post(f"{BASE_URL}/auth/register", 
                json={
                    "email": test_email,
                    "password": "123456",
                    "name": "Upload E2E"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.session_token = data.get("session_token")
                self.user_id = data.get("user", {}).get("user_id")
                self.log_test("User Registration", True, 
                             f"User registered successfully. Token: {self.session_token[:20]}...")
                return True
            elif response.status_code == 400 and "ya está registrado" in response.json().get("detail", ""):
                # User already exists, try login
                return await self.test_user_login(test_email)
            else:
                self.log_test("User Registration", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Registration", False, error=e)
            return False

    async def test_user_login(self, email):
        """Login with existing user"""
        try:
            response = requests.post(f"{BASE_URL}/auth/login", 
                json={
                    "email": email,
                    "password": "123456"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.session_token = data.get("session_token")
                self.user_id = data.get("user", {}).get("user_id")
                self.log_test("User Login", True, 
                             f"User logged in successfully. Token: {self.session_token[:20]}...")
                return True
            else:
                self.log_test("User Login", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Login", False, error=e)
            return False

    async def test_image_upload_analysis(self):
        """Test 2: Test image upload and analysis"""
        if not self.session_token:
            self.log_test("Image Upload Analysis", False, "No session token available")
            return False
        
        try:
            png_bytes = self.create_test_png()
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                tmp_file.write(png_bytes)
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('test_dog.png', f, 'image/png')}
                    data = {
                        'dog_id': '',
                        'message': 'Analiza esta foto de mi perro',
                        'file_type': 'image',
                        'language': 'Spanish'
                    }
                    
                    headers = {'Authorization': f'Bearer {self.session_token}'}
                    
                    response = requests.post(f"{BASE_URL}/chat/upload", 
                                           files=files, 
                                           data=data,
                                           headers=headers,
                                           timeout=60)
                
                if response.status_code == 200:
                    result = response.json()
                    if (result.get('role') == 'assistant' and 
                        result.get('content') and 
                        result.get('file_type') == 'image'):
                        self.log_test("Image Upload Analysis", True, 
                                     f"Image analyzed successfully. Response length: {len(result.get('content', ''))} chars")
                        return True
                    else:
                        self.log_test("Image Upload Analysis", False, 
                                     f"Invalid response structure: {result}")
                        return False
                else:
                    self.log_test("Image Upload Analysis", False, 
                                 f"Status: {response.status_code}, Response: {response.text}")
                    return False
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_test("Image Upload Analysis", False, error=e)
            return False

    async def test_pdf_upload_analysis(self):
        """Test 3: Test PDF upload and analysis"""
        if not self.session_token:
            self.log_test("PDF Upload Analysis", False, "No session token available")
            return False
        
        try:
            pdf_bytes = self.create_test_pdf()
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
                tmp_file.write(pdf_bytes)
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('blood_test.pdf', f, 'application/pdf')}
                    data = {
                        'dog_id': '',
                        'message': 'Analiza este análisis de sangre',
                        'file_type': 'pdf',
                        'language': 'Spanish'
                    }
                    
                    headers = {'Authorization': f'Bearer {self.session_token}'}
                    
                    response = requests.post(f"{BASE_URL}/chat/upload", 
                                           files=files, 
                                           data=data,
                                           headers=headers,
                                           timeout=60)
                
                if response.status_code == 200:
                    result = response.json()
                    if (result.get('role') == 'assistant' and 
                        result.get('content') and 
                        result.get('file_type') == 'pdf'):
                        self.log_test("PDF Upload Analysis", True, 
                                     f"PDF analyzed successfully. Response length: {len(result.get('content', ''))} chars")
                        return True
                    else:
                        self.log_test("PDF Upload Analysis", False, 
                                     f"Invalid response structure: {result}")
                        return False
                else:
                    self.log_test("PDF Upload Analysis", False, 
                                 f"Status: {response.status_code}, Response: {response.text}")
                    return False
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_test("PDF Upload Analysis", False, error=e)
            return False

    async def test_invalid_file_type_rejection(self):
        """Test 4: Test invalid file type rejection"""
        if not self.session_token:
            self.log_test("Invalid File Type Rejection", False, "No session token available")
            return False
        
        try:
            text_bytes = self.create_invalid_text_file()
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as tmp_file:
                tmp_file.write(text_bytes)
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('invalid.txt', f, 'text/plain')}
                    data = {
                        'dog_id': '',
                        'message': 'Test invalid file',
                        'file_type': 'image',  # Claiming it's an image but sending text
                        'language': 'Spanish'
                    }
                    
                    headers = {'Authorization': f'Bearer {self.session_token}'}
                    
                    response = requests.post(f"{BASE_URL}/chat/upload", 
                                           files=files, 
                                           data=data,
                                           headers=headers,
                                           timeout=30)
                
                if response.status_code == 400:
                    self.log_test("Invalid File Type Rejection", True, 
                                 f"Correctly rejected invalid file type. Status: 400")
                    return True
                else:
                    self.log_test("Invalid File Type Rejection", False, 
                                 f"Expected 400, got {response.status_code}. Response: {response.text}")
                    return False
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_test("Invalid File Type Rejection", False, error=e)
            return False

    async def test_upload_without_auth(self):
        """Test 5: Test upload without authentication"""
        try:
            png_bytes = self.create_test_png()
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                tmp_file.write(png_bytes)
                tmp_file_path = tmp_file.name
            
            try:
                with open(tmp_file_path, 'rb') as f:
                    files = {'file': ('test.png', f, 'image/png')}
                    data = {
                        'dog_id': '',
                        'message': 'Test without auth',
                        'file_type': 'image',
                        'language': 'Spanish'
                    }
                    
                    # No Authorization header
                    
                    response = requests.post(f"{BASE_URL}/chat/upload", 
                                           files=files, 
                                           data=data,
                                           timeout=30)
                
                if response.status_code == 401:
                    self.log_test("Upload Without Auth", True, 
                                 f"Correctly rejected unauthorized request. Status: 401")
                    return True
                else:
                    self.log_test("Upload Without Auth", False, 
                                 f"Expected 401, got {response.status_code}. Response: {response.text}")
                    return False
            finally:
                os.unlink(tmp_file_path)
                
        except Exception as e:
            self.log_test("Upload Without Auth", False, error=e)
            return False

    async def test_regular_chat(self):
        """Test 6: Test regular chat still works"""
        if not self.session_token:
            self.log_test("Regular Chat", False, "No session token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.session_token}'}
            data = {
                'content': 'Hola Heimdall',
                'dog_id': ''
            }
            
            response = requests.post(f"{BASE_URL}/chat", 
                                   json=data,
                                   headers=headers,
                                   timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('role') == 'assistant' and result.get('content'):
                    self.log_test("Regular Chat", True, 
                                 f"Chat working correctly. Response length: {len(result.get('content', ''))} chars")
                    return True
                else:
                    self.log_test("Regular Chat", False, 
                                 f"Invalid response structure: {result}")
                    return False
            else:
                self.log_test("Regular Chat", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Regular Chat", False, error=e)
            return False

    async def test_english_chat(self):
        """Test 7: Test chat with English (language detection)"""
        if not self.session_token:
            self.log_test("English Chat", False, "No session token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.session_token}'}
            data = {
                'content': 'Hello Heimdall, how is my dog doing today?',
                'dog_id': ''
            }
            
            response = requests.post(f"{BASE_URL}/chat", 
                                   json=data,
                                   headers=headers,
                                   timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('role') == 'assistant' and result.get('content'):
                    content = result.get('content', '').lower()
                    # Check if response contains English words and not Spanish
                    english_indicators = ['hello', 'how', 'today', 'your', 'doing', 'great', 'well']
                    spanish_indicators = ['hola', 'cómo', 'hoy', 'tu', 'haciendo', 'bien', 'está']
                    
                    has_english = any(word in content for word in english_indicators)
                    has_spanish = any(word in content for word in spanish_indicators)
                    
                    if has_english or not has_spanish:
                        self.log_test("English Chat", True, 
                                     f"Language detection working. Response appears to be in English")
                        return True
                    else:
                        self.log_test("English Chat", False, 
                                     f"Response appears to be in Spanish despite English input: {content[:200]}")
                        return False
                else:
                    self.log_test("English Chat", False, 
                                 f"Invalid response structure: {result}")
                    return False
            else:
                self.log_test("English Chat", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("English Chat", False, error=e)
            return False

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("FILE UPLOAD & ANALYSIS - TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for test in self.test_results if test['success'])
        total = len(self.test_results)
        
        print(f"PASSED: {passed}/{total}")
        print(f"SUCCESS RATE: {(passed/total*100):.1f}%")
        
        print("\nDETAILED RESULTS:")
        for test in self.test_results:
            status = "✅" if test['success'] else "❌"
            print(f"  {status} {test['test']}")
            if test['error'] and not test['success']:
                print(f"     Error: {test['error']}")
        
        print("\nCRITICAL ISSUES:")
        failed_tests = [test for test in self.test_results if not test['success']]
        if not failed_tests:
            print("  None - All tests passed!")
        else:
            for test in failed_tests:
                print(f"  ❌ {test['test']}: {test['error'] or 'Check details above'}")
        
        return passed, total

async def main():
    """Main test execution"""
    print("Starting Heimdall File Upload & Analysis Testing...")
    print(f"Backend URL: {BASE_URL}")
    print("="*60)
    
    tester = BackendTester()
    
    # Execute tests in sequence
    await tester.test_user_registration()
    await tester.test_image_upload_analysis()
    await tester.test_pdf_upload_analysis() 
    await tester.test_invalid_file_type_rejection()
    await tester.test_upload_without_auth()
    await tester.test_regular_chat()
    await tester.test_english_chat()
    
    # Print summary
    passed, total = tester.print_summary()
    
    return passed, total

if __name__ == "__main__":
    asyncio.run(main())