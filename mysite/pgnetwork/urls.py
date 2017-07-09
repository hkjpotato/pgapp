from django.conf.urls import url, include
from . import views
app_name = 'pgnetwork' #add name space for {% url %}, for templated usage

urlpatterns = [
    url(r'^tableview/(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/$', views.tableview, name='tableview'),
    url(r'^forcevis/(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/$', views.forcevis, name='forcevis'),
]