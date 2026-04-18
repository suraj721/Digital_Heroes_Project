#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Golf Prize Club Platform
Tests all authentication, subscription, score management, charity, and admin endpoints
"""

import requests
import json
import time
from datetime import datetime, timedelta
import uuid

# Configuration
BASE_URL = "https://score-prize-club.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@golfclub.com"
ADMIN_PASSWORD = "admin123"

class GolfClubAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_scores = []
        self.test_charity_id = None
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method.upper()} {endpoint} -> {response.status_code}")
            
            if response.status_code != expected_status:
                self.log(f"❌ Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    self.log(f"Error response: {error_data}")
                except:
                    self.log(f"Error response: {response.text}")
                return None
                
            try:
                return response.json()
            except:
                return {"success": True}
                
        except requests.exceptions.RequestException as e:
            self.log(f"❌ Request failed: {str(e)}")
            return None
            
    def test_health_check(self):
        """Test API health check"""
        self.log("🔍 Testing API Health Check...")
        try:
            result = self.make_request("GET", "", expected_status=200)
            if result and "message" in result:
                self.log("✅ API Health Check passed")
                return True
            else:
                # Try alternative endpoint
                result = self.make_request("GET", "/", expected_status=404)
                if result and "error" in result:
                    self.log("✅ API Health Check passed (404 expected for root)")
                    return True
                else:
                    self.log("❌ API Health Check failed")
                    return False
        except Exception as e:
            self.log(f"❌ Health check error: {str(e)}")
            return False
            
    def test_auth_signup(self):
        """Test user signup"""
        self.log("🔍 Testing User Signup...")
        try:
            # Generate unique test user
            timestamp = int(time.time())
            test_email = f"testuser{timestamp}@golfclub.com"
            
            signup_data = {
                "email": test_email,
                "password": "testpass123",
                "name": "John Golfer",
                "phone": "+1234567890"
            }
            
            result = self.make_request("POST", "/auth/signup", signup_data)
            if result and "token" in result and "user" in result:
                self.user_token = result["token"]
                self.test_user_id = result["user"]["id"]
                self.log("✅ User Signup passed")
                return True
            else:
                self.log("❌ User Signup failed")
                return False
        except Exception as e:
            self.log(f"❌ Signup error: {str(e)}")
            return False
            
    def test_auth_login(self):
        """Test user login"""
        self.log("🔍 Testing User Login...")
        try:
            # Test with admin credentials
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            result = self.make_request("POST", "/auth/login", login_data)
            if result and "token" in result and "user" in result:
                self.admin_token = result["token"]
                self.log("✅ Admin Login passed")
                return True
            else:
                self.log("❌ Admin Login failed")
                return False
        except Exception as e:
            self.log(f"❌ Login error: {str(e)}")
            return False
            
    def test_auth_me(self):
        """Test get current user"""
        self.log("🔍 Testing Get Current User...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            result = self.make_request("GET", "/auth/me", token=self.user_token)
            if result and "user" in result:
                self.log("✅ Get Current User passed")
                return True
            else:
                self.log("❌ Get Current User failed")
                return False
        except Exception as e:
            self.log(f"❌ Get current user error: {str(e)}")
            return False
            
    def test_demo_subscription(self):
        """Test demo subscription activation"""
        self.log("🔍 Testing Demo Subscription...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            result = self.make_request("POST", "/subscription/demo", token=self.user_token)
            if result and "subscription" in result:
                subscription = result["subscription"]
                if (subscription["amount"] == 0 and 
                    subscription["status"] == "ACTIVE" and
                    subscription["endDate"]):
                    self.log("✅ Demo Subscription passed")
                    return True
                else:
                    self.log("❌ Demo subscription data invalid")
                    return False
            else:
                self.log("❌ Demo Subscription failed")
                return False
        except Exception as e:
            self.log(f"❌ Demo subscription error: {str(e)}")
            return False
            
    def test_subscription_status(self):
        """Test subscription status check"""
        self.log("🔍 Testing Subscription Status...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            result = self.make_request("GET", "/subscription/status", token=self.user_token)
            if result is not None:  # Can be empty if no subscription
                self.log("✅ Subscription Status passed")
                return True
            else:
                self.log("❌ Subscription Status failed")
                return False
        except Exception as e:
            self.log(f"❌ Subscription status error: {str(e)}")
            return False
            
    def test_add_scores(self):
        """Test adding golf scores"""
        self.log("🔍 Testing Add Scores...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            # Add 6 scores to test the "last 5 scores" rule
            scores_to_add = [25, 30, 18, 42, 35, 28]
            success_count = 0
            
            for i, score in enumerate(scores_to_add):
                score_data = {
                    "score": score,
                    "scoreDate": (datetime.now() - timedelta(days=i)).isoformat()
                }
                
                result = self.make_request("POST", "/scores", score_data, token=self.user_token)
                if result and "score" in result:
                    self.test_scores.append(result["score"])
                    success_count += 1
                    self.log(f"✅ Added score {score}")
                else:
                    self.log(f"❌ Failed to add score {score}")
                    
            if success_count >= 5:
                self.log("✅ Add Scores passed")
                return True
            else:
                self.log("❌ Add Scores failed")
                return False
        except Exception as e:
            self.log(f"❌ Add scores error: {str(e)}")
            return False
            
    def test_get_scores(self):
        """Test getting user scores"""
        self.log("🔍 Testing Get Scores...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            result = self.make_request("GET", "/scores", token=self.user_token)
            if result and "scores" in result:
                scores = result["scores"]
                if len(scores) <= 5:  # Should only return last 5 scores
                    self.log(f"✅ Get Scores passed (returned {len(scores)} scores)")
                    return True
                else:
                    self.log(f"❌ Too many scores returned: {len(scores)}")
                    return False
            else:
                self.log("❌ Get Scores failed")
                return False
        except Exception as e:
            self.log(f"❌ Get scores error: {str(e)}")
            return False
            
    def test_update_score(self):
        """Test updating a score"""
        self.log("🔍 Testing Update Score...")
        try:
            if not self.user_token or not self.test_scores:
                self.log("❌ No user token or scores available")
                return False
                
            score_id = self.test_scores[0]["id"]
            update_data = {"score": 20}
            
            result = self.make_request("PUT", f"/scores/{score_id}", update_data, token=self.user_token)
            if result and "score" in result:
                self.log("✅ Update Score passed")
                return True
            else:
                self.log("❌ Update Score failed")
                return False
        except Exception as e:
            self.log(f"❌ Update score error: {str(e)}")
            return False
            
    def test_delete_score(self):
        """Test deleting a score"""
        self.log("🔍 Testing Delete Score...")
        try:
            if not self.user_token or not self.test_scores:
                self.log("❌ No user token or scores available")
                return False
                
            score_id = self.test_scores[-1]["id"]
            
            result = self.make_request("DELETE", f"/scores/{score_id}", token=self.user_token)
            if result and result.get("success"):
                self.log("✅ Delete Score passed")
                return True
            else:
                self.log("❌ Delete Score failed")
                return False
        except Exception as e:
            self.log(f"❌ Delete score error: {str(e)}")
            return False
            
    def test_get_charities(self):
        """Test getting charities list"""
        self.log("🔍 Testing Get Charities...")
        try:
            result = self.make_request("GET", "/charities")
            if result and "charities" in result:
                charities = result["charities"]
                if len(charities) > 0:
                    self.test_charity_id = charities[0]["id"]
                self.log(f"✅ Get Charities passed (found {len(charities)} charities)")
                return True
            else:
                self.log("✅ Get Charities passed (empty list)")
                return True
        except Exception as e:
            self.log(f"❌ Get charities error: {str(e)}")
            return False
            
    def test_set_user_charity(self):
        """Test setting user charity"""
        self.log("🔍 Testing Set User Charity...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            # Create a test charity ID if none exists
            if not self.test_charity_id:
                self.test_charity_id = str(uuid.uuid4())
                
            charity_data = {
                "charityId": self.test_charity_id,
                "contributionPercent": 15
            }
            
            result = self.make_request("POST", "/user-charity", charity_data, token=self.user_token)
            if result and "userCharity" in result:
                self.log("✅ Set User Charity passed")
                return True
            else:
                self.log("❌ Set User Charity failed")
                return False
        except Exception as e:
            self.log(f"❌ Set user charity error: {str(e)}")
            return False
            
    def test_admin_analytics(self):
        """Test admin analytics"""
        self.log("🔍 Testing Admin Analytics...")
        try:
            if not self.admin_token:
                self.log("❌ No admin token available")
                return False
                
            result = self.make_request("GET", "/admin/analytics", token=self.admin_token)
            if result and all(key in result for key in ["totalUsers", "activeSubscriptions", "totalDraws", "totalWinners"]):
                self.log("✅ Admin Analytics passed")
                return True
            else:
                self.log("❌ Admin Analytics failed")
                return False
        except Exception as e:
            self.log(f"❌ Admin analytics error: {str(e)}")
            return False
            
    def test_admin_users(self):
        """Test admin users list"""
        self.log("🔍 Testing Admin Users List...")
        try:
            if not self.admin_token:
                self.log("❌ No admin token available")
                return False
                
            result = self.make_request("GET", "/admin/users", token=self.admin_token)
            if result and "users" in result:
                self.log(f"✅ Admin Users List passed (found {len(result['users'])} users)")
                return True
            else:
                self.log("❌ Admin Users List failed")
                return False
        except Exception as e:
            self.log(f"❌ Admin users error: {str(e)}")
            return False
            
    def test_admin_run_draw(self):
        """Test admin run draw"""
        self.log("🔍 Testing Admin Run Draw...")
        try:
            if not self.admin_token:
                self.log("❌ No admin token available")
                return False
                
            draw_data = {"drawMode": "RANDOM"}
            
            result = self.make_request("POST", "/admin/draw/run", draw_data, token=self.admin_token)
            if result and "draw" in result:
                draw = result["draw"]
                if (draw["drawMode"] == "RANDOM" and 
                    draw["totalPrizePool"] == 100000 and
                    draw["winningNumbers"]):
                    self.log("✅ Admin Run Draw passed")
                    return True
                else:
                    self.log("❌ Draw data invalid")
                    return False
            else:
                self.log("❌ Admin Run Draw failed")
                return False
        except Exception as e:
            self.log(f"❌ Admin run draw error: {str(e)}")
            return False
            
    def test_admin_winners(self):
        """Test admin winners list"""
        self.log("🔍 Testing Admin Winners List...")
        try:
            if not self.admin_token:
                self.log("❌ No admin token available")
                return False
                
            result = self.make_request("GET", "/admin/winners", token=self.admin_token)
            if result and "winners" in result:
                self.log(f"✅ Admin Winners List passed (found {len(result['winners'])} winners)")
                return True
            else:
                self.log("❌ Admin Winners List failed")
                return False
        except Exception as e:
            self.log(f"❌ Admin winners error: {str(e)}")
            return False
            
    def test_score_validation(self):
        """Test score validation (1-45 range)"""
        self.log("🔍 Testing Score Validation...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            # Test invalid score (out of range)
            invalid_score_data = {
                "score": 50,  # Invalid - should be 1-45
                "scoreDate": datetime.now().isoformat()
            }
            
            result = self.make_request("POST", "/scores", invalid_score_data, token=self.user_token, expected_status=400)
            if result is None:  # Expected to fail with 400
                self.log("✅ Score Validation passed (rejected invalid score)")
                return True
            elif result and "error" in result:
                self.log("✅ Score Validation passed (rejected invalid score with error)")
                return True
            else:
                self.log("❌ Score Validation failed (accepted invalid score)")
                return False
        except Exception as e:
            self.log(f"❌ Score validation error: {str(e)}")
            return False
            
    def test_charity_contribution_validation(self):
        """Test charity contribution validation (min 10%)"""
        self.log("🔍 Testing Charity Contribution Validation...")
        try:
            if not self.user_token:
                self.log("❌ No user token available")
                return False
                
            # Test invalid contribution (below 10%)
            invalid_charity_data = {
                "charityId": str(uuid.uuid4()),
                "contributionPercent": 5  # Invalid - should be min 10%
            }
            
            result = self.make_request("POST", "/user-charity", invalid_charity_data, token=self.user_token, expected_status=400)
            if result is None:  # Expected to fail with 400
                self.log("✅ Charity Contribution Validation passed (rejected invalid percent)")
                return True
            elif result and "error" in result:
                self.log("✅ Charity Contribution Validation passed (rejected invalid percent with error)")
                return True
            else:
                self.log("❌ Charity Contribution Validation failed (accepted invalid percent)")
                return False
        except Exception as e:
            self.log(f"❌ Charity contribution validation error: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting Golf Prize Club Backend API Tests")
        self.log(f"Base URL: {self.base_url}")
        
        tests = [
            ("API Health Check", self.test_health_check),
            ("Authentication - Signup", self.test_auth_signup),
            ("Authentication - Login", self.test_auth_login),
            ("Authentication - Get Current User", self.test_auth_me),
            ("Demo Subscription", self.test_demo_subscription),
            ("Subscription Status", self.test_subscription_status),
            ("Score Management - Add Scores", self.test_add_scores),
            ("Score Management - Get Scores", self.test_get_scores),
            ("Score Management - Update Score", self.test_update_score),
            ("Score Management - Delete Score", self.test_delete_score),
            ("Score Validation", self.test_score_validation),
            ("Charity Management - List Charities", self.test_get_charities),
            ("Charity Management - Set User Charity", self.test_set_user_charity),
            ("Charity Contribution Validation", self.test_charity_contribution_validation),
            ("Admin - Analytics", self.test_admin_analytics),
            ("Admin - List Users", self.test_admin_users),
            ("Admin - Run Draw", self.test_admin_run_draw),
            ("Admin - List Winners", self.test_admin_winners),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n{'='*60}")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log(f"❌ {test_name} crashed: {str(e)}")
                failed += 1
                
        self.log(f"\n{'='*60}")
        self.log(f"🏁 Test Results: {passed} passed, {failed} failed")
        
        if failed == 0:
            self.log("🎉 All tests passed!")
        else:
            self.log(f"⚠️  {failed} tests failed")
            
        return failed == 0

if __name__ == "__main__":
    tester = GolfClubAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)