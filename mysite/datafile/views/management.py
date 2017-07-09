from django.shortcuts import render
from ..forms import UploadGLMForm
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect
from ..utils.helpers import createVisJson
from django.urls import reverse

# Create your views here.

# the helper function to parse/export the glm file
from OpenSourceParser import ImportGLM, ExportGLM

import os, json, datetime
from django.conf import settings
BASE_DIR = settings.BASE_DIR
MEDIA_URL = settings.MEDIA_URL
DATA_DIR = os.path.join(BASE_DIR, 'data')
PROJECTS_DIR = os.path.join(DATA_DIR, 'Projects')

def safeListdir(path):
    ''' Helper function that returns [] for dirs that don't exist. Otherwise new users can cause exceptions. '''
    try: return [x for x in os.listdir(path) if not x.startswith(".") and os.path.isdir(os.path.join(path, x))]
    except: return []

'''
Projects Overview /projects/ 
@get and post a list of projects
'''
def projects_overview(request):
    error_msg = None
    success_msg = None
    if request.method == 'POST':
        new_project_name = request.POST.get('project_name')
        print 'hello the input is ', new_project_name
        if (
            '.' in new_project_name or
            ' ' in new_project_name or
            new_project_name in safeListdir(PROJECTS_DIR)
        ):
            if '.' in new_project_name:
                error_msg = 'invalid project name!'
            if ' ' in new_project_name:
                error_msg = 'no space in project name please!'
            if new_project_name in safeListdir(PROJECTS_DIR):
                error_msg = 'duplicate project name!'
        else:
            #create project folder
            createNewProject(new_project_name)
            success_msg = '%s is created!' % new_project_name
    projects = [{'projectName': x} for x in safeListdir(PROJECTS_DIR)]
    # loop through the projects to get the meta data (the project must have meta data!!)
    for project in projects:
        #TODO: why we use try catch instead of with open?
        try:
            projectPath = os.path.join(PROJECTS_DIR, project['projectName'])
            metaData = json.load(open(os.path.join(projectPath, 'project_meta.json')))
            project['status'] = metaData.get('status', "N/A")
            project['type'] = metaData.get('type', "N/A")
            project['created'] = metaData.get('created', "N/A")
            project['der_valuation'] = metaData.get('der_valuation', None)
        except Exception:
            print Exception
            continue
    return render(request, 'datafile/projects_overview.html', 
        {'projects': projects, 'error_msg': error_msg, 'success_msg': success_msg})

'''
helper function to create new project folder
'''
def createNewProject(new_project_name, ):
    PROJECT_DIR = os.path.join(PROJECTS_DIR, new_project_name);
    os.makedirs(PROJECT_DIR)
    
    currTime = datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')
    #create meta json
    project_meta = {
        "name": new_project_name,
        "type": "Power Flow",
        "status": "N/A",
        "created": currTime
    }
    with open(os.path.join(PROJECT_DIR, 'project_meta.json'), 'w') as infile:
        json.dump(project_meta, infile, indent=4)


'''
Project Detail /projects/projectName

the project detail, which show all the feeders in the current project
'''
def project_detail(request, projectName):
    PROJECT_DIR = os.path.join(PROJECTS_DIR, projectName)
    feeders = []
    'list all the feeder in the current project folder'
    feeders = [{'feederName': x} for x in safeListdir(PROJECT_DIR)]
    # loop through the feeders to get the meta data (the file must have meta data!!)
    for feeder in feeders:
        #TODO: why we use try catch instead of with open?
        try:
            FEEDER_DIR = os.path.join(PROJECT_DIR, feeder['feederName'])
            metaData = json.load(open(os.path.join(FEEDER_DIR, 'meta.json')))
            feeder['glmname'] = metaData.get('glmname', "N/A")
            feeder['json'] = metaData.get('json', "N/A")
            # if Feeder.objects.filter(name=feeder['feederName']).exists():
            feeder['explore'] = {
                #reverse with name space
                "tableview": reverse('pgnetwork:tableview', kwargs={'projectName': projectName, 'feederName': feeder['feederName']}),
            }
            # else:
                # feeder['explore'] = False
            feeder['supplemental'] = metaData.get('supplemental', "N/A")
        except:
            print 'SOME ERROR'
            continue
    return render(request, 'datafile/project_detail.html', {'feeders': feeders, 'projectName': projectName})



'''
Upload GLM to a feeder
'''
def upload_glm(request, projectName):
    if request.method == 'POST':
        form = UploadGLMForm(request.POST, request.FILES)
        if form.is_valid():
            feederName = form.cleaned_data['feeder_name']
            handle_uploaded_glm(projectName, feederName, request.FILES['glm_file'])
            the_url = reverse('datafile:project_detail', kwargs={'projectName': projectName})
            return HttpResponseRedirect(the_url)
    else:
        form = UploadGLMForm()
    return render(request, 'datafile/upload_glm.html', {'form': form, 'projectName': projectName})

'''
createNewFeeder
set up the basic folder structure for feeder
1. create a folder for the new feeder & 
2. create json & glmIn & glmOut & supplemental folders
3. save the metajson
'''
def createNewFeederFolder(projectName, feederName, glmFile):
    FEEDER_DIR = os.path.join(PROJECTS_DIR, projectName, feederName)
    os.makedirs(FEEDER_DIR)

    #create json/glmIn/glmOut/supplemental folders
    folders = ['json', 'glmIn', 'glmOut', 'supplemental'];
    for folder in folders:
        FOLDER_DIR = os.path.join(FEEDER_DIR, folder);
        os.makedirs(FOLDER_DIR)

    #create meta json
    metaJson = {
        "glmname": glmFile.name,
        "json": "YES",
        "supplemental": "N/A"
    }

    with open(os.path.join(FEEDER_DIR, 'meta.json'), 'w') as infile:
        json.dump(metaJson, infile, indent=4)

    return FEEDER_DIR
'''
handle_uploaded_glm
//it means creating a new feeder currently
1. create a folder for the new feeder
2. save the glm to glmIn folder
4. convert the glm and save the json output to the json folder
'''
def handle_uploaded_glm(projectName, feederName, glmFile):
    print 'handle_uploaded file!...should be async'
    # create the feeder folder
    FEEDER_DIR = createNewFeederFolder(projectName, feederName, glmFile)


    # # write the glm file to the glmIn folder (TODO: maybe always name input glm as 'main.glm')
    GLM_IN_FILE_DIR = os.path.join(FEEDER_DIR, 'glmIn', 'main.glm')
    with open(GLM_IN_FILE_DIR, 'wb+') as destination:
        for chunk in glmFile.chunks():
            destination.write(chunk)

    JSON_DIR = os.path.join(FEEDER_DIR, 'json')
    convertGLM2JSON(GLM_IN_FILE_DIR, JSON_DIR)
    return True

'''
helper function to prepare the require json files for a given glm
1. pg.json (the output of ImportGLM parser, the source of everything, including visible network and info)
2. vis.json (only include the vis data)
'''
def convertGLM2JSON(glmPath, JSON_DIR):
    pythonDict = ImportGLM(glmPath)
    # save this in memory dict to somewhere else if you worry about the open source problem

    pgJson = pythonDict
    # save the pgjson as the ONLY SOURCE of glm data for frontend!!
    with open(os.path.join(JSON_DIR, 'pg.json'), 'w') as outFile:
        json.dump(pgJson, outFile, indent=4)

    visJson = createVisJson(pgJson)
    with open(os.path.join(JSON_DIR, 'vis.json'), 'w') as outFile:
        json.dump(visJson, outFile, indent=4)
    return True



'''
convert data source(pgJson) to glm file and save it in glmOut folder
'''
def convert_glm(request, projectName, feederName):
    msg = 'Fail'
    FEEDER_DIR = os.path.join(PROJECTS_DIR, projectName, feederName)
    if not os.path.isdir(FEEDER_DIR):
        return HttpResponse(status=404)
    #findGLM_OUT_DIR
    GLM_OUT_DIR = os.path.join(FEEDER_DIR, 'glmOut')
    if os.path.isdir(GLM_OUT_DIR):
        print 'you are updating it'
        # return HttpResponse('the rawOut is available', status=200)
    else:
        os.makedirs(GLM_OUT_DIR)

    #The data source(might be database later)
    PGJSON_DIR = os.path.join(FEEDER_DIR, 'json', 'pg.json')
    #Use the current pgJson to make the glm string
    glmString = ExportGLM(PGJSON_DIR)

    #save the glm to glmOut folder
    currTime = datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
    glmName = "%s.main.glm" % (currTime)
    with open(os.path.join(GLM_OUT_DIR, glmName), 'w') as glmFile:
        glmFile.write(glmString)
        msg = 'Success'
    return HttpResponse(msg, status=200)


'''
display the glm out
'''
from urllib import quote
def glm_out(request, projectName, feederName):
    FEEDER_DIR = os.path.join(PROJECTS_DIR, projectName, feederName)
    # prepare the glmOutFolder if it is not created
    GLM_OUT_DIR = os.path.join(FEEDER_DIR, 'glmOut')
    # http://stackoverflow.com/questions/3964681/find-all-files-in-a-directory-with-extension-txt-in-python
    # http://stackoverflow.com/questions/120951/how-can-i-normalize-a-url-in-python
    allGlmFiles = [
        {
            "group": x.split('.')[0],
            "name": x, 
            "path": quote(os.path.join(MEDIA_URL, 'Projects', projectName, feederName, 'glmOut', x)) #this is the actual url
        } for x in os.listdir(GLM_OUT_DIR) if x.endswith(".glm")
    ]
    glmFilesGroup = {}
    for item in allGlmFiles:
        if not item['group'] in glmFilesGroup:
            glmFilesGroup[item['group']] = []
        glmFilesGroup[item['group']].append(item)

    return render(request, 'datafile/glm_out.html', {
        'glmFilesGroup': glmFilesGroup,
        'projectName': projectName,
        'feederName': feederName
    })