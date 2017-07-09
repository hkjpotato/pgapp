from django.conf.urls import url
from . import views

app_name = 'datafile' #add name space for {% url %}
#wire the views into the urls
urlpatterns = [
    # file management
    url(r'^$', views.projects_overview, name="projects_overview"),
    url(r'^(?P<projectName>[\w ]+)/$', views.project_detail, name="project_detail"),
    url(r'^(?P<projectName>[\w ]+)/upload_glm/$', views.upload_glm, name="upload_glm"),
    url(r'^(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/convert_glm$', views.convert_glm, name='convert_glm'),
    url(r'^(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/glm_out$', views.glm_out, name='glm_out'),
    #json data
    url(r'^(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/get_pg_json$', views.get_pg_json, name='get_pg_json'),
    url(r'^(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/save_pg_json$', views.save_pg_json, name='save_pg_json'),
    url(r'^(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/get_vis_json$', views.get_vis_json, name='get_vis_json'),
    url(r'^(?P<projectName>[\w ]+)/(?P<feederName>[\w ]+)/save_vis_json$', views.save_vis_json, name='save_vis_json'),
]
