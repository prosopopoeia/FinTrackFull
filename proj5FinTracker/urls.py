from django.urls import path

from . import views

urlpatterns = [
    path("", views.vmonth, name="vmonth"),
    path("login", views.vlogin, name="vlogin"),
    path("logout", views.vlogout, name="vlogout"),
    path("register", views.vregister, name="vregister"),
    path("vinput", views.vinput, name="vinput"),
    path("vupload", views.vupload, name="vupload"),
    path("vupdateEntry", views.vupdateEntry, name="vupdateEntry"),
    path("vmonth", views.vmonth, name="vmonth"),
    path("vyear", views.vyear, name="vyear"),
    path("vrange", views.vrange, name="vrange"),
    path("vcompare", views.vcompare, name="vcompare"),
    path("jsvmonth", views.jsvmonth, name="jsvmonth"),
    path("jsvcat", views.jsvcat, name="jsvcat"),
    path("jsvdelete", views.jsvdelete, name="jsvdelete"),
    path("jsvsave", views.jsvsave, name="jsvsave"),
    path("jsvrange", views.jsvrange, name="jsvrange"),
    path("edittransaction", views.edittransaction, name="edittransaction"),
]