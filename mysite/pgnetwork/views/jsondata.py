from django.views.decorators.csrf import csrf_exempt
import os, json
from django.conf import settings



# get the component schema
def getComponentTemplates(request):
    # componentsSchemaPath = os.path.join(BASE_DIR, 'distribution', 'static', 'distribution','component-schema')
    # componentsSchemaJson = [x for x in os.listdir(componentsSchemaPath) if x.endswith('.json')]
    # componentsSchema = {name[0:-5]:json.load(open(os.path.join(componentsSchemaPath, name))) for name in componentsSchemaJson}
    # return JsonResponse(componentsSchema, safe=False)
