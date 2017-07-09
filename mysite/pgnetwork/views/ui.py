from django.shortcuts import render

templatePrefix = 'pgnetwork'

def tableview(request, projectName, feederName='no feeder name provided : ('):
    return render(
        request,
        templatePrefix + '/' + 'tableview.html', 
        {   
            'projectName': projectName,
            'feederName': feederName,
        }
    )


def forcevis(request, projectName, feederName='no feeder name provided : ('):
    return render(
        request,
        templatePrefix + '/' + 'forcevis.html', 
        {   
            'projectName': projectName,
            'feederName': feederName,
        }
    )