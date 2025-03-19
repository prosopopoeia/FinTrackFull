import json
import enum
from django.contrib.auth import authenticate, login, logout
from django.core.files import File
from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.urls import reverse
from django.db import IntegrityError
from django.db.models import Sum, Count, Avg, Max, Min  
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from datetime import datetime, date
from json import dumps

from .models import User, BankTransaction
from .forms import InputBankStatementForm, FindByDateForm, TransactionForm, FindByRangeForm, CompareForm, GetYearForm, RandomFactoidForm, RemoveFromFactoidsForm

from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfparser import PDFParser
import re


from io import StringIO

###TODO REMOVE NOT CALLED###
def index(request):
    if request.user.is_authenticated:
        return render(request, "proj5FinTracker/singlePageTransactions.html")

    else:
        return HttpResponseRedirect(reverse("vlogin"))
       
    
def vlogin(request):
    if request.method == "POST":
        uname = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=uname, password=password)
    
        if user is not None:
            login(request, user)
            request.session["current_user"] = uname
            return HttpResponseRedirect(reverse("vmonth"))
        else:
            return render(request, "proj5FinTracker/login.html", {
                "message" : "Please, you have not logged in to your use account."
            })
    else:
        return render(request, "proj5FinTracker/login.html", {
                "message" : "Please, you have not logged in to your use account."
            })


def vlogout(request):
    logout(request)
    return HttpResponseRedirect(reverse("vlogin"))


def vregister(request):
    if request.method == "POST":
        uname = request.POST["username"]
        email = request.POST["email"]
        
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "proj5FinTracker/register.html", {
                "message" : "Passwords must match!"
            })
        
        try:
            user = User.objects.create_user(uname, email, password)
            user.save()
        except IntegrityError:
            return render(request, "proj5FinTracker/register.html", {
                "message" : "Username taken"
            })
        login(request, user)
        request.session["current_user"] = uname
        return HttpResponseRedirect(reverse("vmonth"))
    else:
        return render(request, "proj5FinTracker/register.html")



#-------called from input.js---------#   

@csrf_exempt
def vupdateEntry(request):
    data = json.loads(request.body)
    vdesc = data['ddescription']
    c_user = get_user(request)
    
    tmp_amt = data['damt']
    tmp = 'success'
    formatted_amt = tmp_amt.replace(",","")    
    try:
        BankTransaction.objects.create(
                    trans_date=data['ddate'],
                    trans_owner=c_user,
                    trans_amt = float(formatted_amt),
                    trans_msg = vdesc,
                    trans_category = data['dcat'],
                    trans_group = data['dgroup']
                    )
    except:
        tmp = 'fail'


    return JsonResponse({"msg1": formatted_amt,#,#data['ddate'],
                        "msg2": c_user.username,#data['damt'],
                        "msg3": tmp,
                        "msg4": vdesc})
                        
 
def get_text_month(month_ord):
    
    months =   ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"]
    return months[month_ord - 1]    
    
    
def get_month_ordinal(month_str):
    
    months =   ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"]
    return (months.index(month_str) + 1)
 
class Period(enum.Enum):
   Day = 1
   Month = 2
   Year = 3 
   All = 4

class Type(enum.Enum):
    No_type = 0
    Cat = 1
    Group = 2
    Amount = 3 
   
    

@login_required
def vmonth(request):
    return byDateProcessing(request, Period.Month.value) 


@login_required
def vyear(request):
    return byDateProcessing(request, Period.Year.value)
          
          
@login_required
def byDateProcessing(request, period):
    try:
        this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
        
    #grab transactions for month & user
    FBDF = FindByDateForm()
    tform = TransactionForm()   
    
    return render(request, "proj5FinTracker/singlePageTransactions.html", {
        'search_form' : FBDF,
        'trans_form' : tform,
        'dperiod' : period      
    })


#-------called from month.js---------#                        
@login_required
@csrf_exempt
def jsvperiod(request):
    data = json.loads(request.body)
    vdate = data["jsdate"]
    if vdate == 0: 
        vyr = date.today().year
        vmo = date.today().month
    else:
        vyr = int(vdate[0:4])
        vmo = int(vdate[5:7])
        vdy = int(vdate[8:10])        

    try:
       this_user = get_user(request)
    except:
       return HttpResponseRedirect(reverse("vlogin"))
    
    if data["jstype"] == Period.Month.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo)
    elif data["jstype"] == Period.Year.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=vyr)
    else:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user)
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)

@csrf_exempt
def jsvgetaverage(request):
    data = json.loads(request.body)
    

@csrf_exempt
def jsvgetaggs(request):
    data = json.loads(request.body)
    vdate = data["jsdate"]
    vcat = data["jscat"]
    vtype = data["jsctype"]
    vexclusion = data["jsexclusion"]
    
    if vdate == 0: 
        vyr = date.today().year
        vmo = date.today().month
    else:
        vyr = int(vdate[0:4])
        vmo = int(vdate[5:7])
        vdy = int(vdate[8:10])
    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))    
    trancount = 0
    tranavg = 0
    vtranavg = 0
    tranmin = 0
    transum = 0
    transumPositives = 0
    transumSpent=0    

    # if we want month data
    if data["jstype"] == Period.Month.value:
        transumPositives = BankTransaction.objects.filter(
            trans_owner=this_user,
            trans_date__year=vyr,
            trans_date__month=vmo, 
            trans_amt__gt=0).aggregate(Sum('trans_amt'))
        # do we have anything we want to exclude from the aggregate?
        if vexclusion == "":
             transumSpent = BankTransaction.objects.filter(
                trans_owner=this_user, 
                trans_date__year=vyr, 
                trans_date__month=vmo, 
                trans_amt__lt=0).aggregate(Sum('trans_amt'))
        else:
            transumSpent = BankTransaction.objects.filter(
            trans_owner=this_user,
            trans_date__year=vyr, 
            trans_date__month=vmo, 
            trans_amt__lt=0).exclude(trans_group__in=vexclusion).exclude(trans_category__in=vexclusion ).aggregate(Sum('trans_amt'))
            
        # we are just grabbing data by the year
        if vcat == "":            
            trancount = BankTransaction.objects.filter(
            trans_owner=this_user, 
            trans_date__year=vyr,
            trans_date__month=vmo).count()
            if vexclusion != "":
                print(vexclusion)
                trancount -= len(vexclusion)
                tranmin = BankTransaction.objects.filter(
                trans_owner=this_user, 
                trans_date__year=vyr,
                trans_date__month=vmo).exclude(trans_group__in=vexclusion).exclude(trans_category__in=vexclusion ).aggregate(Min('trans_amt'))
                
                transum = BankTransaction.objects.filter(
                trans_owner=this_user, trans_date__year=vyr, 
                trans_date__month=vmo).exclude(trans_group__in=vexclusion).exclude(trans_category__in=vexclusion ).aggregate(Sum('trans_amt'))
            else:
                tranmin = BankTransaction.objects.filter(
                    trans_owner=this_user, 
                    trans_date__year=vyr, 
                    trans_date__month=vmo).aggregate(Min('trans_amt'))
                    
                transum = BankTransaction.objects.filter(
                    trans_owner=this_user, 
                    trans_date__year=vyr, 
                    trans_date__month=vmo).aggregate(Sum('trans_amt'))
         # we are gragging data for a specific category
        else:
            if vtype == Type.Cat:
                trancount = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_category=vcat).count()
                tranavg = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_category=vcat).aggregate(Avg('trans_amt'))
                tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_category=vcat).aggregate(Min('trans_amt'))
                transum = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_category=vcat).aggregate(Sum('trans_amt'))
               
            else:
                trancount = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_group=vcat).count()
                tranavg = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_group=vcat).aggregate(Avg('trans_amt'))
                tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_group=vcat).aggregate(Min('trans_amt'))
                transum = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo, trans_group=vcat).aggregate(Sum('trans_amt'))
     # get data for a specified year           
    elif data["jstype"] == Period.Year.value:
        transumPositives = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_amt__gt=0).aggregate(Sum('trans_amt'))
        if vexclusion != "":
            print(vexclusion)
            transumSpent = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_amt__lt=0).exclude(trans_group__in=vexclusion).exclude(trans_category__in=vexclusion ).aggregate(Sum('trans_amt'))
        else:
            transumSpent = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_amt__lt=0).aggregate(Sum('trans_amt'))
        if vcat == "":
            trancount = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr).count()
            if vexclusion != "":                
                trancount -= len(vexclusion);
                tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr).exclude(trans_category__in=vexclusion ).exclude(trans_group__in=vexclusion).aggregate(Min('trans_amt'))
                transum = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr).exclude(trans_category__in=vexclusion ).exclude(trans_group__in=vexclusion).aggregate(Sum('trans_amt'))
            else:
                tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr).aggregate(Min('trans_amt'))
                transum = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr).aggregate(Sum('trans_amt'))
        elif vtype == Type.Cat:            
            trancount = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_category=vcat).count()
            tranavg = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_category=vcat).aggregate(Avg('trans_amt'))
            tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_category=vcat).aggregate(Min('trans_amt'))
            transum = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_category=vcat).aggregate(Sum('trans_amt'))
        else:
            trancount = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_group=vcat).count()
            tranavg = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_group=vcat).aggregate(Avg('trans_amt'))
            tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_group=vcat).aggregate(Min('trans_amt'))
            transum = BankTransaction.objects.filter(trans_owner=this_user, trans_date__year=vyr, trans_group=vcat).aggregate(Sum('trans_amt'))
    # get all data
    else:
        transumPositives = BankTransaction.objects.filter(trans_owner=this_user, trans_amt__gt=0).aggregate(Sum('trans_amt'))
        transumSpent = BankTransaction.objects.filter(trans_owner=this_user, trans_amt__lt=0).aggregate(Sum('trans_amt'))
        # if vexclusion == "":        
            # transumSpent = BankTransaction.objects.filter(trans_owner=this_user, trans_amt__lt=0).aggregate(Sum('trans_amt'))
        # else:
            # transumSpent = BankTransaction.objects.filter(trans_owner=this_user, trans_amt__lt=0).exclude(trans_category__in=vexclusion ).aggregate(Sum('trans_amt'))
        if vcat == "":
            trancount = BankTransaction.objects.filter(trans_owner=this_user).count()
            tranmin = BankTransaction.objects.filter(trans_owner=this_user).exclude(trans_group__in=vexclusion).exclude(trans_category__in=vexclusion ).aggregate(Min('trans_amt'))
            transum = BankTransaction.objects.filter(trans_owner=this_user).exclude(trans_group__in=vexclusion).exclude(trans_category__in=vexclusion ).aggregate(Sum('trans_amt'))
            # if vexclusion == "":
                # tranmin = BankTransaction.objects.filter(trans_owner=this_user).exclude(trans_category__in=vexclusion ).aggregate(Min('trans_amt'))
                # transum = BankTransaction.objects.filter(trans_owner=this_user).exclude(trans_category__in=vexclusion ).aggregate(Sum('trans_amt'))
            # else:
                # tranmin = BankTransaction.objects.filter(trans_owner=this_user).aggregate(Min('trans_amt'))
                # transum = BankTransaction.objects.filter(trans_owner=this_user).aggregate(Sum('trans_amt'))
        elif vtype == Type.Cat:
            trancount = BankTransaction.objects.filter(trans_owner=this_user, trans_category=vcat).count()
            tranavg = BankTransaction.objects.filter(trans_owner=this_user, trans_category=vcat).aggregate(Avg('trans_amt'))
            tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_category=vcat).aggregate(Min('trans_amt'))
            transum = BankTransaction.objects.filter(trans_owner=this_user, trans_category=vcat).aggregate(Sum('trans_amt'))
        else:
            trancount = BankTransaction.objects.filter(trans_owner=this_user, trans_group=vcat).count()
            tranavg = BankTransaction.objects.filter(trans_owner=this_user, trans_group=vcat).aggregate(Avg('trans_amt'))
            tranmin = BankTransaction.objects.filter(trans_owner=this_user, trans_group=vcat).aggregate(Min('trans_amt'))
            transum = BankTransaction.objects.filter(trans_owner=this_user, trans_group=vcat).aggregate(Sum('trans_amt'))
    
    mei1 = ""
    mei2 = ""
    vtranavg = 0
    vtranmin = 0
    vtransum = 0
    vtransumPos = 0
    
    if tranavg != 0 and tranavg['trans_amt__avg'] is not None:
        vtranavg = "{:.2f}".format(tranavg['trans_amt__avg'])
        
    if tranmin != 0 and tranmin['trans_amt__min'] is not None:
        vtranmin = "{:.2f}".format(tranmin['trans_amt__min'])
        if vcat == "":
            mei = BankTransaction.objects.filter(trans_owner=this_user, trans_amt=vtranmin)
            mei1 = mei[0].trans_msg
            mei2 = mei[0].trans_category
            
        elif vtype == 1:
            mei = BankTransaction.objects.filter(trans_owner=this_user, trans_amt=vtranmin, trans_category=vcat)
            mei1 = mei[0].trans_msg
            mei2 = mei.first().trans_date
        else:
            mei = BankTransaction.objects.filter(trans_owner=this_user, trans_amt=vtranmin, trans_group=vcat)
            mei1 = mei[0].trans_category
            mei2 = mei.first().trans_date
            
    if transum != 0 and transum['trans_amt__sum'] is not None:
        vtransum = "{:.2f}".format(transum['trans_amt__sum'])
        
    if transumPositives != 0 and transumPositives['trans_amt__sum'] is not None:
        vtransumPos = "{:.2f}".format(transumPositives['trans_amt__sum'])
    
    if transumSpent != 0 and transumSpent['trans_amt__sum'] is not None:
        vtransumSpent = "{:.2f}".format(transumSpent['trans_amt__sum'])
    else:
        vtransumSpent = 0
    
    return JsonResponse({"agcount": trancount, 
                    "agavg": vtranavg, 
                    "agmin": vtranmin, 
                    "agsum": vtransum,
                    "agsumPos": vtransumPos,
                    "mostExpensiveItem1": mei1,
                    "mostExpensiveItem2": mei2,
                    "totalSpent" : vtransumSpent}) 


"""###
import json

def json_response(something):
    return HttpResponse(
        json.dumps(something),
        content_type = 'application/javascript; charset=utf8'
    )
    ###
    """
    
@csrf_exempt
def jsvreturnearliestdate(request):
    #earliest_transaction_date = 
    return JsonResponse({"earliest": BankTransaction.objects.earliest('trans_date').trans_date})
    
    
@csrf_exempt
def jsvreturnbyyear(request):
    data = json.loads(request.body)
    vcat = data['jscat']
    vgroup = data['jsgrp']
    vdate = data['jsdate']
    
    try:
        this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))    
    
    if vcat != 0:
        print('in cat if')
        print(vcat)
        yearsTotal = BankTransaction.objects.filter(
            trans_owner=this_user, 
            trans_category=vcat, 
            trans_date__year=vdate
        ).aggregate(Sum('trans_amt'))
        
        years_avg = BankTransaction.objects.filter(
            trans_owner=this_user, 
            trans_category=vcat, 
            trans_date__year=vdate
        ).aggregate(Avg('trans_amt'))
        
        yearsCount = BankTransaction.objects.filter(
            trans_owner=this_user, 
            trans_category=vcat, 
            trans_date__year=vdate
        ).count()
        
    else:
       # print('in group else')
        #print(vgroup)
        yearsTotal = BankTransaction.objects.filter(
            trans_owner=this_user, 
            trans_group=vgroup, 
            trans_date__year=vdate
        ).aggregate(Sum('trans_amt'))
        
        years_avg = BankTransaction.objects.filter(
            trans_owner=this_user, 
            trans_group=vgroup, 
            trans_date__year=vdate
        ).aggregate(Avg('trans_amt'))
        
        yearsCount = BankTransaction.objects.filter(
            trans_owner=this_user, 
            trans_group=vgroup, 
            trans_date__year=vdate
        ).count()
        
    if yearsTotal['trans_amt__sum'] is not None:
        vtransumSpent = "{:.2f}".format(yearsTotal['trans_amt__sum'])
    else:
        vtransumSpent = 0
        
    if years_avg['trans_amt__avg'] is not None:
        vtran_avg = "{:.2f}".format(years_avg['trans_amt__avg'])
    else:
        vtran_avg = 0
    print('averages')
    print(years_avg)
    print(vtran_avg)
    return JsonResponse({"yearSum": vtransumSpent,
                                                            "yearCount": yearsCount,
                                                            "yearAvg": vtran_avg})    
                                                            
                                                            
# if tranavg != 0 and tranavg['trans_amt__avg'] is not None:
        # vtranavg = "{:.2f}".format(tranavg['trans_amt__avg'])
                                                          
# def jsvreturnbyyear(request):
    # data = json.loads(request.body)
    # vcat = data['jscat']
    # vgroup = data['jsgrp']
    # vdate = data['jsdate']
    
    # try:
        # this_user = get_user(request)
    # except:
        # return HttpResponseRedirect(reverse("vlogin"))    
    
    # if vcat != "":
        # yearsTotal =  BankTransaction.objects.filter(trans_owner=this_user, 
                                                                                                                                                                        # trans_category=vcat, 
                                                                                                                                                                        # trans_date__year=vdate).aggregate(Sum('trans_amt'))
    # else:
        # yearsTotal =  BankTransaction.objects.filter(trans_owner=this_user, 
                                                                                                                                                                        # trans_group=vgroup, 
                                                                                                                                                                        # trans_date__year=vdate).aggregate(Sum('trans_amt'))   
                                                                                                                                                                        
    # yearsTotal['trans_amt__sum'] is not None:
        # vtransumSpent = "{:.2f}".format(yearsTotal['trans_amt__sum'])
    # else:
        # vtransumSpent = 0
        
    # return  JsonResponse({"yearSum": vtransumSpent})
        
@login_required
@csrf_exempt
def jsvmonth(request):
    data = json.loads(request.body)
    vdate = data["jsdate"]
    if vdate == 0: 
        vyr = date.today().year
        vmo = date.today().month
    else:
        vyr = int(vdate[0:4])
        vmo = int(vdate[5:7])
        vdy = int(vdate[8:10])        

    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
    
    if data["jstype"] == Period.Month.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo)
    elif data["jstype"] == Period.Year.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=vyr)
    else:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user)
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)

### View a range of transactions of a user-supplied period 
def vrange(request):
    fbrform = FindByRangeForm()
    return render(request, "proj5FinTracker/range.html", {
        'rangeform' : fbrform
    })

def vcompare(request):
    cmpform = CompareForm()
    return render(request, "proj5FinTracker/compare.html", {
        'compareform' : cmpform
    })

def vanalysis(request):
    gyfform = GetYearForm()
    return render(request, "proj5FinTracker/analysis.html", {
        'gyfform' : gyfform
    })

def vanrando(request):
    rfform = RandomFactoidForm()
    rfrform = RemoveFromFactoidsForm()
    return render(request, "proj5FinTracker/randomFactoid.html", {
        'rfform' : rfform,
        'rfrform' : rfrform    
    })
  
@login_required
@csrf_exempt
def jsvrange(request):    
    data = json.loads(request.body)
    vbegindate = data["begindate"]
    venddate = data["enddate"]
    
    begyr = int(vbegindate[0:4])
    begmo = int(vbegindate[5:7])
    begdy = int(vbegindate[8:10])        
    
    endyr = int(venddate[0:4])
    endmo = int(venddate[5:7])
    enddy = int(venddate[8:10])
    
    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
        
    transactions = BankTransaction.objects.order_by("-trans_date").filter(
        trans_owner=this_user,
        trans_date__range=[vbegindate,venddate])
        # trans_date__month__gte=begmo, 
        # trans_date__year__gte=begyr, 
        # trans_date__day__gte=begdy, 
        # trans_date__month__lte=endmo, 
        # trans_date__year__lte=endyr, 
        # trans_date__day__lte=enddy)
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)

@login_required
@csrf_exempt
def jsvcat(request):    
    data = json.loads(request.body)
    category = data["jscat"]
    group = data["jsgrp"]
    mo_yr = data["jsdate"] #e.g. 2021-10-01
    jperiod = data["jsperiod"];
    
    if jperiod != Period.All.value:
        month = mo_yr[5:7]    
        year = mo_yr[0:4] 
     
    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
    
    if group == 0:
        if jperiod == Period.Year.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=year, trans_category=category)
        elif jperiod == Period.Month.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__month=month, trans_date__year=year, trans_category=category)
        else:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_category=category)
    else:
        if jperiod == Period.Year.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=year, trans_group=group)    
        elif jperiod == Period.Month.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__month=month, trans_date__year=year, trans_group=group)    
        else:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_group=group)
    
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)

@login_required
@csrf_exempt
def jsvcatfact(request):    
    data = json.loads(request.body)
   
    category = data["jscat"]
    group = data["jsgrp"]
    mo_yr = data["jsdate"] #e.g. 2021-10-01
    jperiod = data["jsperiod"];
    
    if jperiod != Period.All.value:
        month = mo_yr[5:7]    
        year = mo_yr[0:4] 
     
    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
    
    if jperiod == Period.Year.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=year, trans_group=group)    
    elif jperiod == Period.Month.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__month=month, trans_date__year=year, trans_group=group)    
    else:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_group=group)
    
   
    
    #to_get_the_grouping = BankTransaction.objects.filter(trans_owner=this_user, trans_category=category).first()
    print("loggign")
    if jperiod == Period.Year.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=year, trans_group=group)    
    elif jperiod == Period.Month.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__month=month, trans_date__year=year, trans_group=group)    
    else:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_group=group)
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)
    
@login_required
@csrf_exempt
def jsvsave(request):
    data = json.loads(request.body)
    current_user = get_user(request)
    ############ conversion point ##############    
    BankTransaction.objects.create(
        trans_date = data['trans_date'],
        trans_amt = data['trans_amt'],
        trans_msg = data['trans_msg'],
        trans_category = data['trans_category'],
        trans_owner = current_user,
        trans_group = data['trans_group'])
    return JsonResponse({"message": "success"}, status=302) 
    

@csrf_exempt
def jsvdelete(request): 
    data = json.loads(request.body)
    tranID = data['jid']
    try:
        transactionToDelete = BankTransaction.objects.get(id=tranID)
        transactionToDelete.delete()
        msg = 'success'
    except:
        msg = 'fail'
            
    return JsonResponse({"message": msg, "vid": tranID}, status=201) 


@csrf_exempt
def edittransaction(request):
    data = json.loads(request.body)
    vid = data['jid']
    
    tranny = BankTransaction.objects.get(id=vid)
    dotran = data['jdate']
    vyr = int(dotran[0:4])
    vmo = int(dotran[5:7])
    vdy = int(dotran[8:10])
    
    vreload_necessary = False
    if  (tranny.trans_amt == data['jamt']) or (tranny.trans_msg == data['jmsg']):
        vreload_necessary = True
############ conversion point ##############            
    tranny.trans_date = date(vyr, vmo, vdy)
    tranny.trans_msg = data['jmsg']
    tranny.trans_amt = data['jamt']
    tranny.trans_category = data['jcat']
    tranny.trans_group = data['jgrp']
    
    try:
        tranny.save()
        vmsg = tranny
    except:
        vmsg = 'fail'
    
    return JsonResponse({"reload_necessary" : vreload_necessary}, status=201)

#-------called from input.html-------------#   

def vinput(request):
    ibsForm = InputBankStatementForm()
    return render(request, "proj5FinTracker/input.html", {
        'tform' : ibsForm,
    })

                     
@csrf_exempt
def vupload(request):    
    #####################################################################
    ## IMPORTANT: REMOVE ANY BLANK LINES FROM CSV OR IT WILL DIE HERE! ##
    ## even just put transactions in erase.txt                         ##
    #####################################################################
    ###parse PDF document###
    bf_str = StringIO()
    bf_open = request.FILES['file_name']
    
    transactions_needing_classification = parse_csv(bf_open, request)   
    
    dmp = dumps(transactions_needing_classification)
    ibsForm = InputBankStatementForm()
    return render(request, "proj5FinTracker/input.html", {
        'tform' : ibsForm,
        'dmp': dmp,
        #uncomment for diagnostic info
        'msg5' : bf_open.name.upper(),
        'msg3': bf_str,
        'msg6': bf_str.getvalue()#transactions_needing_classification
    })
        
def get_user(request):
    return User.objects.get(username = request.session["current_user"])
      
def parse_csv(csv_file, request):
    ######################################
    #CSV Headings: Transaction Date,Check Number,Description,Debit Amount,Credit Amount
    ##################OR##################
    #CC Heading: Status,Date,Description,Debit,Credit,Member Name
    ######################################
    
    csv_str = str(csv_file.read())
            #csv_strip = csv_str.strip()
    csv_mod = re.sub('[\']', '', csv_str)
    csv_list = csv_mod.split('\\r\\n')
    #return csv_list #UNCOMMENT TO DEBUG
    #["Status,Date,Description,Debit,Credit,Member Name", "Cleared,12/30/2019, HIHO SERVICE AUTO REPAIR ENGLEWOOD CO ,180.45,,RONNI C MONSTER", "Cleared,12/28/2019, FANCY TIGER CRAFTS DENVER CO ,50.20,,RONNI C MONSTER", "Cleared,12/27/2019, COSTCO WHSE #1027 SHERIDAN CO ,27.99,,RONNI C MONSTER", "Cleared,12/27/2019, COSTCO WHSE #0468 LONE TREE CO ,92.91,,JASON Z ISAACS"] 
    #[Transaction Date, Check Nuumber, Description, Debit Amount, Credit Amount]
    #[Transaction Date,Description,Debit Amount,Credit Amount]
    incomplete_transactions = []
    c_user = get_user(request)
    firstEntry = True
    idate = 0
    idesc = 0
    idebit = 0
    icredit = 0
    
    isBank = True
    for csv_entry in csv_list:
        # first row will be headings, get the order of the columns
        if firstEntry:
            firstEntry = False
            elem_count = 0
            
            # figure out which element is which in csv by using headings 
            # done by getting column number of each element
            heading_elems = csv_entry.split(',')
            for elems in heading_elems:
                #determine if we have a bank csv...
                #if elems.upper().find("STATUS") == -1:
                #    isBank = False                     
                if elems.upper().find("DATE") != -1:
                    idate = elem_count
                    #return idate               #UNCOMMENT TO DEBUG
                if elems.upper().find("DESC") != -1:
                    idesc = elem_count
                    #return idesc
                if elems.upper().find("DEBIT") != -1:
                    idebit = elem_count
                    #return idebit
                if elems.upper().find("CREDIT") != -1:
                    icredit = elem_count 
                    #return icredit
                elem_count += 1
            continue
        #return "have header"
        csv_elements = csv_entry.split(',')       
        split_date = csv_elements[idate].split('/')       
        
        try: 
            # put date in format that works for Django date objects...
            tdate = split_date[2] + '-' + split_date[0] + '-' + split_date[1]
            #return tdate
            tdesc = re.sub('^\d\d/\d\d', '', csv_elements[idesc]) # replace date digits with ""
            #return tdesc
            if tdesc.upper().find("XFER") != -1:
                continue
                        
            tdebit = 0
            if csv_elements[idebit] != '0':
                tdebit = float(csv_elements[idebit]) * -1
                #return tdebit
            else:             
                tcredit = float(csv_elements[icredit])                            
                #return tcredit
        except:
            continue
                
        try: 
            #return "in try"
            #do we have transaction with the same desc...
           
            duplicate = False
            #return "after dupe dec"
            bto = BankTransaction.objects.filter(
                    trans_owner=c_user,
                    trans_msg=tdesc.strip(),
                    # trans_amt=tdebit
                    ) 
            # if this is a duplicate, continue to the next
            #return "have bto"
            for matching_trans in bto:
                #return str(matching_trans.trans_date)
                #return tdate
                if str(tdate) == str(matching_trans.trans_date):# and (bto.trans_amt == tdebit or bto.trans_amt == tcredit):
                    duplicate = True
                    break
            if duplicate == True:
                continue            
            #return bto.trans_msg
            #we have everything we need to save the transaction
            tcat = bto.first().trans_category
            #return bto.first().trans_msg
            tgroup = bto.first().trans_group
            
            
            if tdebit == 0:
                ramt = tcredit                
            else: 
                ramt = tdebit
            BankTransaction.objects.create(
                        trans_date=tdate,
                        trans_owner=c_user,
                        trans_amt = ramt,
                        trans_msg = tdesc.strip(),
                        trans_category = tcat,
                        trans_group = tgroup
                        )
                        
        except:
            #...or does the transaction need to be classified
            trans_str = tdate + ' ' + "{:.2f}".format(tdebit if (tdebit != 0) else tcredit) + ' ' + tdesc
            incomplete_transactions.append(trans_str.strip())
                        
    return incomplete_transactions
                  
    
# def parse_csv(csv_file, request):
    # ######################################
    # #CSV Headings: Transaction Date,Check Number,Description,Debit Amount,Credit Amount
    # ##################OR##################
    # #CC Heading: Status,Date,Description,Debit,Credit,Member Name
    # ######################################
    
    # csv_str = str(csv_file.read())
            # #csv_strip = csv_str.strip()
    # csv_mod = re.sub('[\']', '', csv_str)
    # csv_list = csv_mod.split('\\r\\n')
    # #return csv_list #UNCOMMENT TO DEBUG
    # #["Status,Date,Description,Debit,Credit,Member Name", "Cleared,12/30/2019, HIHO SERVICE AUTO REPAIR ENGLEWOOD CO ,180.45,,RONNI C MONSTER", "Cleared,12/28/2019, FANCY TIGER CRAFTS DENVER CO ,50.20,,RONNI C MONSTER", "Cleared,12/27/2019, COSTCO WHSE #1027 SHERIDAN CO ,27.99,,RONNI C MONSTER", "Cleared,12/27/2019, COSTCO WHSE #0468 LONE TREE CO ,92.91,,JASON Z ISAACS"] 
    # #[Transaction Date, Check Nuumber, Description, Debit Amount, Credit Amount]
    # #[Transaction Date,Description,Debit Amount,Credit Amount]
    # incomplete_transactions = []
    # c_user = get_user(request)
    # firstEntry = True
    # idate = 0
    # idesc = 0
    # idebit = 0
    # icredit = 0
    
    # isBank = True
    # for csv_entry in csv_list:
        # # first row will be headings, get the order of the columns
        # if firstEntry:
            # firstEntry = False
            # elem_count = 0
            
            # # figure out which element is which in csv by using headings 
            # # done by getting column number of each element
            # heading_elems = csv_entry.split(',')
            # for elems in heading_elems:
                # #determine if we have a bank csv...
                # #if elems.upper().find("STATUS") == -1:
                # #    isBank = False                     
                # if elems.upper().find("DATE") != -1:
                    # idate = elem_count
                    # #return idate               #UNCOMMENT TO DEBUG
                # if elems.upper().find("DESC") != -1:
                    # idesc = elem_count
                    # #return idesc
                # if elems.upper().find("DEBIT") != -1:
                    # idebit = elem_count
                    # #return idebit
                # if elems.upper().find("CREDIT") != -1:
                    # icredit = elem_count 
                    # #return icredit
                # elem_count += 1
            # continue
        # #return "have header"
        # csv_elements = csv_entry.split(',')       
        # split_date = csv_elements[idate].split('/')       
        
        # try: 
            # # put date in format that works for Django date objects...
            # tdate = split_date[2] + '-' + split_date[0] + '-' + split_date[1]
            # #return tdate
            # tdesc = re.sub('^\d\d/\d\d', '', csv_elements[idesc]) # replace date digits with ""
            # #return tdesc
            # if tdesc.upper().find("XFER") != -1:
                # continue
                        
            # tdebit = 0
            # if csv_elements[idebit] != '0':
                # tdebit = float(csv_elements[idebit]) * -1
                # #return tdebit
            # else:             
                # tcredit = float(csv_elements[icredit])                            
                # #return tcredit
        # except:
            # continue
                
        # try: 
            # #return "in try"
            # #do we have transaction with the same desc...
           
            # duplicate = False
            # #return "after dupe dec"
            # bto = BankTransaction.objects.filter(
                    # trans_owner=c_user,
                    # trans_msg=tdesc.strip(),
                    # # trans_amt=tdebit
                    # ) 
            # # if this is a duplicate, continue to the next
            # #return "have bto"
            # for matching_trans in bto:
                # #return str(matching_trans.trans_date)
                # #return tdate
                # if str(tdate) == str(matching_trans.trans_date):# and (bto.trans_amt == tdebit or bto.trans_amt == tcredit):
                    # duplicate = True
                    # break
            # if duplicate == True:
                # continue            
            # #return bto.trans_msg
            # #we have everything we need to save the transaction
            # tcat = bto.first().trans_category
            # #return bto.first().trans_msg
            # tgroup = bto.first().trans_group
            
            
            # if tdebit == 0:
                # ramt = tcredit                
            # else: 
                # ramt = tdebit
            # BankTransaction.objects.create(
                        # trans_date=tdate,
                        # trans_owner=c_user,
                        # trans_amt = ramt,
                        # trans_msg = tdesc.strip(),
                        # trans_category = tcat,
                        # trans_group = tgroup
                        # )
                        
        # except:
            # #...or does the transaction need to be classified
            # trans_str = tdate + ' ' + "{:.2f}".format(tdebit if (tdebit != 0) else tcredit) + ' ' + tdesc
            # incomplete_transactions.append(trans_str.strip())
                        
    # return incomplete_transactions
                  

def process_transactions(bank_string, transaction_pattern):   
    #data comes in as one long string which is split on date to format below    
    #'200.00 AUTO XFER CREDIT DDA TRNSFR 0000 *****************80071',
    #'387.01 DENVER PUBLIC SC PR PAYMENT ', '510.00 ONLINE XFER CR', etc. 
    
    transactions = re.split(r'(\d+/\d\d\s+)', bank_string)    
    return transactions[1:]
    
   
   
    