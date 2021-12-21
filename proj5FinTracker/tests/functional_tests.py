from selenium import webdriver
import unittest

class VisitFinPageTest(unittest.TestCase):
    
    def setUp(self):
        self.browser = webdriver.Firefox()

    def tearDown(self):
        self.browser.quit()
        
    def test_expected_Page_Retrieved(self):
        self.browser.get('http://127.0.0.1:8000/')
        self.assertIn('Fantastic Fin-Tracker', self.browser.title)
        list_item1 = self.browser.find_element_by_tag_name('li').text
        self.assertEqual(list_item1, "Month View")
        #month_navigation_link = self.browser.find_element_by_id('navmonth')
        #self.assertEqual( month_navigation_link.get_attribute('href'),'/vmonth') 
        #self.fail('incorrect title, actual title is: ' + self.browser.title)

if __name__ == '__main__':
    unittest.main()
#User logs into site


