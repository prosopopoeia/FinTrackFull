from django.test import Client, TestCase#, RequestFactory
import json
#import proj5FinTracker.views
from django.core.files import File
from proj5FinTracker.models import BankTransaction, User
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.urls import reverse
from datetime import datetime, date

class MostBasicTest(TestCase):
      
    def test_try_pass_assert(self):
        self.assertEqual(1 + 2, 3)
        
class inputStatementTests(TestCase):    

    @classmethod
    def UserFactory(self, name):
        User = get_user_model() #get custom User rather than django.contrib...User        
        gen_user = User.objects.create(username=name)
        gen_user.set_password('password')        
        return gen_user
    
    @staticmethod
    def get_valid_month(self):
        month = date.today().month        
        if (month == 12):
            month = 1
        elif (month == 1):
            month = 12
        else:
            month = month + 1
        return month
    
    @classmethod
    def setUpTestData(cls):    
        cls.gen_user = cls.UserFactory('banjo')
        cls.gen_user.save()
        todays_date = str(date.today().year) + "-" + str(date.today().month) + "-01"
        valid_month = cls.get_valid_month(cls)       
        date_from_this_year = str(date.today().year) + "-" + str(valid_month) + "-01"
        #ID 1
        BankTransaction.objects.create(
            trans_date=todays_date,
            trans_amt="10.00",
            trans_msg="todays transaction",
            trans_category="todays category",
            trans_group="todays group",
            trans_owner=cls.gen_user)
        #ID 2
        BankTransaction.objects.create(
            trans_date=date_from_this_year,
            trans_amt="10.00",
            trans_msg="this years transaction",
            trans_category="this years category",
            trans_group="this years group",
            trans_owner=cls.gen_user)
        #ID 3
        BankTransaction.objects.create(
            trans_date="2020-10-12",
            trans_amt="100.00",
            trans_msg="transnational transaction",
            trans_category="tulette",
            trans_group="gorsha",
            trans_owner=cls.gen_user)
        #ID 4        
        BankTransaction.objects.create(
            trans_date="2020-09-12",
            trans_amt="110.00",
            trans_msg="t2",
            trans_category="t3",
            trans_group="t4",
            trans_owner=cls.gen_user)
        #ID 5        
        BankTransaction.objects.create(
            trans_date="2020-08-12",
            trans_amt="130.00",
            trans_msg="t7",
            trans_category="t6",
            trans_group="t5",
            trans_owner=cls.gen_user)
        #ID 6
        BankTransaction.objects.create(
            trans_date="2020-10-01",
            trans_amt="10.00",
            trans_msg="transnational transaction II",
            trans_category="joil-span",
            trans_group="crinshaw",
            trans_owner=cls.gen_user)
            
        cls.transaction_count = BankTransaction.objects.count()       
            
    def setUp(self):
        response2 = self.client.post('/login', {'username': self.gen_user.username, 'password': 'password'})
    
    #remove with vupdateEntry from views.py
    def test_vUpdateEntry(self):
        test_client = Client()        
        login = test_client.post('/login', {'username': 'banjo', 'password': 'password'})
        jdata = {"ddescription": "t7", "damt": "0", "ddate": "2020-09-03", "dcat": "newcat", "dgroup": "newgroup"}
        response = test_client.post('/vupdateEntry', content_type='application/json', data=jdata, follow=True)
        #print(response.content)
        self.assertEqual(response.content, b'{"msg1": "0", "msg2": "banjo", "msg3": "success", "msg4": "t7"}')
    
    def test_login(self):
        user_logged_in = self.client.login(username=self.gen_user, password="password")
        check_user = User.objects.first()
        #print(check_user)       
        self.assertTrue(user_logged_in)
            
    def test_vregister(self):
        response = self.client.post(reverse('vregister'),
              {"username": "SolomonGrundy",
              "email": "myPal@footFoot.com",
              "password": "1234",
              "confirmation": "1234"},
              follow=True)
        #print(response.content)
        self.assertTemplateUsed('singlePageTransactions.html')
        registrationSucceeded = self.client.login(username="SolomonGrundy", password="1234")
        self.assertTrue(registrationSucceeded)
    
    def test_table_vmonth_redirects(self):   
        """ test 1"""         
        response = self.client.post(reverse('vmonth'))
        #self.assertEqual(str(response.context['username']), 'proppy')
        self.assertEqual(response.status_code, 200)
        #self.assertTemplateUsed(response, 'proj5FinTracker/singlePageTransactions.html')
        
    def test_index(self):
        response = self.client.get(reverse('vimonth'))
        self.assertEqual(response.status_code, 200)    
        
    def test_index_redirects2(self):
        response = self.client.get('/')
        #print(response.content)
        self.assertEqual(response.status_code, 200)
        
    def test_check_template_input(self):
        response = self.client.get('/vinput')
        self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    
    
    def test_range_form_returned(self):
        response = self.client.get('/vrange')        
        self.assertContains(response, 'bybeginrange')
        self.assertContains(response, 'byendrange')
    
    def test_vrange_template(self):
        response = self.client.get('/vrange')
        self.assertTemplateUsed('proj5FinTracker/compare.html')
        
    def test_vcompare(self):
        response = self.client.get('/vcompare')
        self.assertTemplateUsed('proj5FinTracker/compare.html')
        
##############################################################################
##                              JSV TESTS                                   ##
##############################################################################
        
    def test_jsvperiod_other(self):        
        test_client = Client()        
        jdata = {"jsdate": "2020-10-01", "jstype": "2"}        
        response = self.client.post('/jsvperiod', content_type='application/json', data=jdata, follow=True)
        #print(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertIn("tulette", str(response.content))

    def test_jsvmonth_today_month(self):
        Month = 2        
        date_data = {"jsdate": 0, "jstype": Month}
        response = self.client.post('/jsvmonth', content_type='application/json', data=date_data, follow=True)        
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content,[
            {"id": 1, 
            "trans_date": "2021-12-01", 
            "trans_amt": "10.00", 
            "trans_msg": "todays transaction",
            "trans_group": "todays group", 
            "trans_category": "todays category"}])
        self.assertIn("todays transaction", str(response.content))
    
    def test_jsvmonth_today_year(self):
        Year_enum = 3        
        date_data = {"jsdate": 0, "jstype": Year_enum}
        response = self.client.post('/jsvmonth', content_type='application/json', data=date_data, follow=True)        
        self.assertEqual(response.status_code, 200)
        self.assertIn("todays transaction", str(response.content))
            
    def test_jsvmonth_specified_date_month(self):
        Month_enum = 2
        trans_date = "2020-09-12"
        date_data = {"jsdate": trans_date, "jstype": Month_enum}
        response = self.client.post('/jsvmonth', content_type='application/json', data=date_data, follow=True)        
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content,[
            {"id": 4, 
            "trans_date": "2020-09-12", 
            "trans_amt": "110.00", 
            "trans_msg": "t2",
            "trans_group": "t4",
            "trans_category": "t3"}])
        self.assertIn("t2", str(response.content))
    
    def test_jsvmonth_specified_date_year(self):
        Year_enum = 3
        trans_date = "2020-09-12"
        date_data = {"jsdate": trans_date, "jstype": Year_enum}
        response = self.client.post('/jsvmonth', content_type='application/json', data=date_data, follow=True)        
        self.assertEqual(response.status_code, 200)
        self.assertIn("t2", str(response.content))
        
    def test_jsvrange(self):
        jdata = {"begindate": "2020-08-01", "enddate": "2020-10-01"}        
        response = self.client.post('/jsvrange', content_type='application/json', data=jdata, follow=True)
        #print(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertIn("2020-10", str(response.content))
        self.assertIn("2020-08", str(response.content))

    def test_jsvcat_yr(self):
        Year = 3
        transaction_date = "August 2020"        
        
        yrgrp_data = {"jscat": 0, "jsgrp": "t5", "jsperiod": Year, "jsdate": transaction_date}        
        response1 = self.client.post(reverse('jsvcat'), content_type='application/json', data=yrgrp_data, follow=True)
        self.assertEqual(response1.status_code, 200)
        self.assertIn("t5", str(response1.content))
        
        yrcat_data = {"jscat": "t6", "jsgrp": 0, "jsperiod": Year, "jsdate": transaction_date}        
        response2 = self.client.post(reverse('jsvcat'), content_type='application/json', data=yrcat_data, follow=True)
        self.assertEqual(response2.status_code, 200)
        self.assertIn("t5", str(response2.content))        

    def test_jsvcat_mo(self):
        Month = 2        
        transaction_date = "August 2020"
        
        mogrp_data = {"jscat": 0, "jsgrp": "t5", "jsperiod": Month, "jsdate": transaction_date}        
        response1 = self.client.post(reverse('jsvcat'), content_type='application/json', data=mogrp_data, follow=True)
        self.assertEqual(response1.status_code, 200)
        self.assertIn("t5", str(response1.content))
        
        mocat_data = {"jscat": "t6", "jsgrp": 0, "jsperiod": Month, "jsdate": transaction_date}        
        response2 = self.client.post(reverse('jsvcat'), content_type='application/json', data=mocat_data, follow=True)
        self.assertEqual(response2.status_code, 200)
        self.assertIn("t5", str(response2.content))        
        #print("repo2: ")
        #print(response2.content)
        
    def test_jsvsave_status(self):        
        response = self.client.post('/jsvsave',                     
                  {"trans_date": "2020-02-02",
                  "trans_amt": "100.00",
                  "trans_msg": "transnational transaction",
                  "trans_category": "oaken-wood",
                  "trans_group": "furnishings"},
                  content_type="application/json",
                  current_user="props")
        self.assertEqual(response.status_code, 302)

    def test_jsvsave(self):
        user_data = {"trans_date": "2012-12-21", 
                   "trans_amt": "10.00", 
                   "trans_msg": "test transaction",
                   "trans_category": "cat1",
                   "trans_group": "group1"}
        
        response = self.client.post(reverse('jsvsave'), content_type='application/json', data=user_data)
        ####transaction_count holds the number of objects created during setup###
        self.assertEqual(BankTransaction.objects.count(), (self.transaction_count + 1))
        tranny = BankTransaction.objects.get(trans_date="2012-12-21")
        self.assertEqual(tranny.trans_category, 'cat1')          

    def test_jsvdelete(self):
        test = BankTransaction.objects.create(
            id=100,
            trans_date="2020-10-01",
            trans_amt="10.00",
            trans_msg="transnational transaction II",
            trans_category="joil-span",
            trans_group="crinshaw",
            trans_owner=self.gen_user)
        #print(test.id)
        transaction_data = {"jid": 100}
        if test.id == 100:
            response = self.client.post(reverse('jsvdelete'), content_type='application/json', data=transaction_data)
            self.assertJSONEqual(response.content, {"message": "success", "vid": 100})
            self.assertEqual(response.status_code, 201)
        else:
            self.assertTrue(False)
   
    def test_edittransaction(self):
        test = BankTransaction.objects.create(
            id=100,
            trans_date="2020-10-01",
            trans_amt="10.00",
            trans_msg="msg prior to edit",
            trans_category="cat prior to edit",
            trans_group="group prior to edit",
            trans_owner=self.gen_user)
        transaction_data = {"jid": 100,
                        "jdate": "2020-11-01",
                        "jamt": "100.00",
                        "jmsg": "msg after edit",
                        "jcat": "cat after edit",
                        "jgrp": "group after edit"}
        response = self.client.post(reverse('edittransaction'), content_type='application/json', data=transaction_data)
        self.assertEqual(response.status_code, 201)
        tranny = BankTransaction.objects.get(id=100)
        
        self.assertNotEqual(tranny.trans_date,date(2020,10,1))
        self.assertEqual(tranny.trans_date,date(2020,11,1))
        
        self.assertNotEqual(tranny.trans_amt,10)
        self.assertEqual(tranny.trans_amt,100)
        
        self.assertNotEqual(tranny.trans_msg,"msg prior to edit")
        self.assertEqual(tranny.trans_msg,"msg after edit")

        self.assertNotEqual(tranny.trans_category,"cat prior to edit")
        self.assertEqual(tranny.trans_category,"cat after edit")

        self.assertNotEqual(tranny.trans_group,"group prior to edit")
        self.assertEqual(tranny.trans_group,"group after edit")

    def test_vinputs_template(self):
        response = self.client.post(reverse('vinput'))
        self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    
        
    # def test_vupload(self):
        # with open('proj5FinTracker\\tests\\mocks\\b_est.txt') as fp:
            # print(fp)
            # self.client.post(reverse('vupload'), {'file_name', fp})
        # #print(proj5FinTracker\tests\mocks)
        
##############################################################################
##                              UNIMPLEMENTED                               ##
##############################################################################    
        
    #def test_update(self):
     #   response = self.client.post('/vupdateEntry',
      #      data=json.dumps({
         
    # def test_response_content(self):
        # response = self.client.get('/vupdateEntry')
        # msg = response.json()        
        # self.assertEqual(msg['msg'],"cecil 2")
        
    def test_entry_is_returned(self):
        testFile = open('proj5FinTracker\\tests\\mocks\\b_est.txt', 'r', encoding='utf-8', errors='ignore')
        response = self.client.post(reverse('vupload'), data={'file_name': testFile})
        print(testFile)
        print(response.content)
        #self.assertContains(response,'CREDIT')
        
        self.assertIs(response.status_code, 200)
        
    
        # huh = BankTransaction.objects.create(
                # trans_date="2020-10-1",
                # trans_amt="100.00",
                # trans_msg="transnational transaction",
                # trans_category="torte-le",
                # trans_group="jimp-su",
                # trans_owner=self.gen_user)
        #print(huh)
        #print(BankTransaction.objects.first().trans_category)
        #print(BankTransaction.objects.filter(trans_date__day=1).first().trans_category)
        #loggy = test_client.login(username=self.gen_user.username, password=self.gen_user.password)
        #loggy = self.client.login(username=self.gen_user.username, password='password')
        #response = self.client.post(reverse('jsvperiod'), json.dumps(jdata))
        #test_date = "2020-10-1"
        #data={"jsdate": test_date})
        #repo = response.json()
        #print(repo)
        #print(response.redirect_chain)
        #print(jdata)
        #dumped = json.dumps(jdata)
        #print(dumped)
        #loaded = json.loads(dumped)
        
        #print(self.gen_user.username)
        #print(self.gen_user.password)

    #def test_can_upload_document(self):
        #pass
        #util_client = Client()
        #util_client.login(username=self.gen_user.username, password='password')
        #util_client.FILES = {'file_name': 'mocks\\b_est.txt'}
        #print(util_client.FILES['file_name'])
        #print(util_client.POST)
        #print(self.gen_user.username)      
        #response = self.client.post('/vupload', util_client.FILES)
        #print(response)        
        #self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    

       # def test_jsvperiod_month(self):        
        # using = User.objects.create_user(username='temp', password='pw',  is_active=1, is_superuser=True)
        # using.set_password('pw')
        # using.save()
        # test_client = Client()        
        # #print(User.objects.last())#filter(username='temp'))
        # huh = BankTransaction.objects.create(
                # trans_date="2020-10-01",
                # trans_amt="100.00",
                # trans_msg="transnational transaction",
                # trans_category="torte-le",
                # trans_group="jimp-su",
                # trans_owner=using)        
        
        # jdata = {"jsdate": "2020-10-01", "jstype": "2"}
        # login = test_client.post('/login', {'username': 'temp', 'password': 'pw'})
        # response = test_client.post('/jsvperiod', content_type='application/json', data=jdata, follow=True)
        # #print(response.content)
        # self.assertEqual(response.status_code, 200)
        # self.assertIn("torte-le", str(response.content))

    #def test_login(self):
        #test_client = Client()
        #response = test_client.get('/vlogin', follow=True)
        #print(self.gen_user.username)
        #print(self.gen_user.password)
        #response = test_client.post('/vlogin', {'username': self.gen_user.username, 'password': 'password'})
        #print(response.content)
        #pass
