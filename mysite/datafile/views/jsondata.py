# from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

import os, json
from django.conf import settings
BASE_DIR = settings.BASE_DIR
MEDIA_URL = settings.MEDIA_URL
DATA_DIR = os.path.join(BASE_DIR, 'data')
PROJECTS_DIR = os.path.join(DATA_DIR, 'Projects')


# serve the pgjson
def get_pg_json(request, projectName, feederName):
    PG_JSON_DIR = os.path.join(PROJECTS_DIR, projectName, feederName, 'json', 'pg.json')
    with open(PG_JSON_DIR, "r") as infile:
        data = json.load(infile)
        return JsonResponse(data, safe=False)
    return HttpResponse(status=404) #fail

# save pgjson
@csrf_exempt
def save_pg_json(request, projectName, feederName):
    if request.is_ajax():
        if request.method == 'POST':
            PG_JSON_DIR = os.path.join(PROJECTS_DIR, projectName, feederName, 'json', 'pg.json')
            with open(PG_JSON_DIR, 'w') as outfile:
                data = json.loads(request.body)
                json.dump(data, outfile, indent=4)
            return HttpResponse(status=204) #success,no content return
    return HttpResponse(status=404) #success,no content return


# serve vis json
def get_vis_json(request, projectName, feederName):
    VIS_JSON_DIR = os.path.join(PROJECTS_DIR, projectName, feederName, 'json', 'vis.json')
    with open(VIS_JSON_DIR, "r") as infile:
        data = json.load(infile)
        return JsonResponse(data, safe=False)
    return HttpResponse(status=404) #fail

# save vis json
@csrf_exempt
def save_vis_json(request, projectName, feederName):
    if request.is_ajax():
        if request.method == 'POST':
            VIS_JSON_DIR = os.path.join(PROJECTS_DIR, projectName, feederName, 'json', 'vis.json')
            with open(VIS_JSON_DIR, 'w') as outfile:
                data = json.loads(request.body)
                json.dump(data, outfile, indent=4)
    return HttpResponse(status=204) #success,no content return


