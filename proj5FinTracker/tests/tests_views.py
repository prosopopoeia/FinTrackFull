from django.test import RequestFactory, TestCase
import json
#import proj5FinTracker.views
from proj5FinTracker.models import BankTransaction
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.models import User
from django.urls import reverse


class MostBasicTest(TestCase):
      
    def test_try_pass_assert(self):
        self.assertEqual(1 + 2, 3)
        
class inputStatementTests(TestCase):    

    #run once for class
    @classmethod
    def setUpTestData(cls):
        User = get_user_model() #get custom User rather than django.contrib...User
        main_user = User.objects.create(username='proppy', password='4321')
        secondary_user = User.objects.create(username='props', password='1234')############################
        main_user.save()
        secondary_user.save()
        print(main_user.username)
        
        #secondary_user.save()
        #number_of_transactions = 5
        #for object_number in range(number_of_transactions):
        BankTransaction.objects.create(
                trans_date="2020-12-12",
                trans_amt="100.00",
                trans_msg="transnational transaction",
                trans_category="tulette",
                trans_group="gorsha",
                trans_owner=main_user)
            
        
        BankTransaction.objects.create(
            trans_date="2020-11-12",
            trans_amt="10.00",
            trans_msg="transnational transaction II",
            trans_category="joil-span",
            trans_group="crinshaw",
            trans_owner=main_user)
        
    def setUp(self):
        pass
        
    def test_table_engine(self):   
        """ test 1"""
        #tran = BankTransaction.objects.filter(trans_owner=main_user)
        #print(tran[0].trans_owner.password)
        print(main_user)
        login = self.client.login(username='propy', password='321')
        response = self.client.post(reverse('vmonth'))
        print(login)
        #self.assertEqual(str(response.context['username']), 'proppy')
        self.assertEqual(response.status_code, 302)
        #self.assertTemplateUsed(response, 'proj5FinTracker/singlePageTransactions.html')
        
    def test_index(self):
        response = self.client.get(reverse('vimonth'))
        #self.assertTemplateUsed(response, 'proj5FinTracker/login.html')
        self.assertEqual(response.status_code, 302)    
        
    def test_check_template_input(self):
        response = self.client.get('/vinput')
        self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    

    def test_can_upload_document(self):
        pass#response = self.client.get('/vupload')
        #self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    
        
    def test_check_status(self): 
        #c = self.client(content_type=application/json)
        response = self.client.post('/jsvsave', 
                    
                  {"trans_date": "02-02-2020",
                  "trans_amt": "100.00",
                  "trans_msg": "transnational transaction",
                  "trans_category": "oaken-wood",
                  "trans_group": "furnishings"},
                  content_type="application/json",
                  current_user="props")
        self.assertEqual(response.status_code, 302)
       
    #def test_update(self):
     #   response = self.client.post('/vupdateEntry',
      #      data=json.dumps({
            
            
            
    # def test_login(self):
        # response = self.client.post('/vlogin',
            # username = 'props',
            # password = '1234')
        # print(response)
        # pass#self.assertEqual(response.status_code, 201)
            
    
    # def test_response_content(self):
        # response = self.client.get('/vupdateEntry')
        # msg = response.json()        
        # self.assertEqual(msg['msg'],"cecil 2")
        
    # def test_entry_is_returned(self):
        # testFile = open('proj5FinTracker/d9.pdf', 'r', encoding='utf-8', errors='ignore')
        # response = self.client.post('/vupload', data={'file_name': testFile})
        # self.assertContains(response,'CREDIT')
        # #self.assertIs(response.status_code, 300)
        
    
        