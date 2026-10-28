"""
Selenium end-to-end tests for the Restaurant SaaS Portal deployed on AWS.

Request path tested:
Browser -> ALB -> EC2 -> Nginx (frontend container) -> backend container -> Supabase

Run:
    python test_app.py http://your-alb-dns-name
"""

import json
import os
import sys
import time
import unittest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# ---- Settings -------------------------------------------------------------
# Pass the ALB URL as the first argument, or paste it here.
BASE_URL = "http://PASTE-YOUR-ALB-DNS-NAME-HERE"
if len(sys.argv) > 1 and sys.argv[1].startswith("http"):
    BASE_URL = sys.argv.pop(1)
BASE_URL = BASE_URL.rstrip("/")

DEMO_PHONE = "03001234567"          # built-in demo account (Gourmet Bistro)
UNKNOWN_PHONE = "03111111111"        # not a demo number -> checked by the real backend
HEADLESS = os.environ.get("HEADLESS", "0") == "1"   # set HEADLESS=1 to hide the browser
SCREENSHOT_DIR = "screenshots"
WAIT_SECONDS = 15


class RestaurantPortalTests(unittest.TestCase):
    """Each test starts with a cleared browser session."""

    @classmethod
    def setUpClass(cls):
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        options = webdriver.ChromeOptions()
        if HEADLESS:
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1366,900")
        # Selenium Manager downloads the matching ChromeDriver automatically.
        cls.driver = webdriver.Chrome(options=options)
        cls.wait = WebDriverWait(cls.driver, WAIT_SECONDS)
        print(f"\nTesting: {BASE_URL}\n")

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def setUp(self):
        # Clear the saved login (stored in localStorage) before each test.
        self.driver.get(BASE_URL + "/login")
        self.driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        self.driver.delete_all_cookies()

    def tearDown(self):
        # Screenshot after every test as evidence, e.g. screenshots/test_1_site_loads.png
        self.driver.save_screenshot(os.path.join(SCREENSHOT_DIR, f"{self._testMethodName}.png"))

    # ---- helpers ------------------------------------------------------------
    def open_login(self):
        self.driver.get(BASE_URL + "/login")
        return self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='03001234567']"))
        )

    def sign_in(self, phone, password):
        phone_box = self.open_login()
        password_box = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        phone_box.clear()
        phone_box.send_keys(phone)
        password_box.clear()
        password_box.send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "form button[type='submit']").click()

    def wait_for_dashboard(self):
        return self.wait.until(
            EC.visibility_of_element_located((By.XPATH, "//*[normalize-space()='Sign Out']"))
        )

    # ---- tests ----------------------------------------------------------------
    def test_1_site_loads_through_alb(self):
        """The ALB serves the React app from the Nginx container."""
        start = time.time()
        self.driver.get(BASE_URL)
        self.wait.until(EC.title_contains("Restaurant Order Portal"))
        load_time = time.time() - start
        print(f"  title: {self.driver.title!r}, loaded in {load_time:.2f}s")
        self.assertIn("Restaurant Order Portal", self.driver.title)
        self.assertLess(load_time, WAIT_SECONDS)

    def test_2_login_form_elements_present(self):
        """Heading, phone field, password field and Sign In button are on /login."""
        phone_box = self.open_login()
        heading = self.driver.find_element(By.TAG_NAME, "h1")
        password_box = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        submit = self.driver.find_element(By.CSS_SELECTOR, "form button[type='submit']")
        self.assertEqual(heading.text.strip(), "Restaurant SaaS Portal")
        self.assertTrue(phone_box.is_displayed())
        self.assertTrue(password_box.is_displayed())
        self.assertIn("Sign In", submit.text)

    def test_3_backend_health_api(self):
        """/api/health goes through Nginx to the backend container and Supabase."""
        self.driver.get(BASE_URL + "/api/health")
        body = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body"))).text
        data = json.loads(body)
        print(f"  health: status={data.get('status')} database={data.get('database')}")
        self.assertEqual(data.get("status"), "UP")
        self.assertEqual(data.get("database"), "CONNECTED")

    def test_4_invalid_login_is_rejected(self):
        """Unknown phone + wrong password: the backend rejects it and an error shows."""
        self.sign_in(UNKNOWN_PHONE, "WrongPassword-123")
        error = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "div.bg-rose-50"))
        )
        print(f"  error shown: {error.text[:80]!r}")
        self.assertTrue(error.text.strip())
        self.assertIn("/login", self.driver.current_url)

    def test_5_demo_login_opens_dashboard(self):
        """Signing in with the demo account leaves /login and shows the dashboard."""
        self.sign_in(DEMO_PHONE, "Password123!")
        self.wait.until(lambda d: "/login" not in d.current_url)
        sign_out = self.wait_for_dashboard()
        self.assertTrue(sign_out.is_displayed())

    def test_6_navigation_to_riders_page(self):
        """After login, the sidebar link opens the Riders page (client-side routing)."""
        self.sign_in(DEMO_PHONE, "Password123!")
        self.wait_for_dashboard()
        self.driver.find_element(By.XPATH, "//a[normalize-space()='Riders & Cash']").click()
        self.wait.until(EC.url_contains("/riders"))
        self.assertIn("/riders", self.driver.current_url)


if __name__ == "__main__":
    unittest.main(verbosity=2)
