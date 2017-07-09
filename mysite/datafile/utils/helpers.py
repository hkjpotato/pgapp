
'''
current supported object in visualization
'''
listof_supported_vis_objects = [
'node',
'triplex_node',
'load',
# 'triplex_load', what the xxxx is this?
'capacitor',
'meter',
'triplex_meter',
# 'line_configuration',
# 'line_spacing',
# 'overhead_line_conductor',
# 'underground_line_conductor',
# 'transformer_configuration',
# 'regulator_configuration',
'overhead_line',
'underground_line',
'transformer',
'regulator',
'fuse',
'switch',
# 'climate' ,
# 'csvreader',
'inverter',
'solar',
# 'auction',
# 'controller',
'passive_controller',
# 'voltdump',
# 'volt_var_controller',
# 'billdump',
'house',
'ZIPload',
'waterheater',
# 'player',
# 'recorder',
# 'multi_recorder',
# 'collector',
'battery',
'evcharger_det',
'triplex_line',
# 'triplex_line_conductor',
# 'triplex_line_configuration',
###---this is additional object I found in the glm---###
 # 'class',
 # 'set',
 # 'module',
 'diesel_dg',
 'windturb_dg',
 # 'currdump',
 # 'comment'
]



# create the data for front end vis, similar to React state for the visualization component
def createVisJson(pgJson):
    visJson = {}
    maxGlmIndex = max(pgJson.keys(), key=int)
    visJson['maxGlmIndex'] = maxGlmIndex
    #initial force layout params
    visJson['forceOptions'] = {"theta":"0.8","gravity":"0.01","friction":"0.9","linkStrength":"5",
    "linkDistance":"5","charge":"-5"}
    nodes = []
    links = []
    # loop through the pgJson, filter the supported vis data.
    # TODO: objectType is just for vis purpose
    for glmIndex, item in pgJson.iteritems():
        #check if it is a suppported vis item
        if 'object' in item and item['object'] in listof_supported_vis_objects:
            newVisItem = {}
            newVisItem['glmIndex'] = glmIndex
            newVisItem['object'] = item['object']

            if 'from' in item and 'to' in item:
                #must be a link
                newVisItem['objectType'] = 'fromTo'
                newVisItem['source'] = item['from']
                newVisItem['target'] = item['to']
                links.append(newVisItem)
            else:
                if 'parent' in item and item['parent'] is not None:
                    #add a parentChild link for vis purpose
                    newParentChildLink = {
                        'objectType' : 'parentChild',
                        'source': item['parent'],
                        'target': item['name'],
                    }
                    links.append(newParentChildLink)
                # objectType = 'bus' if item['object'] == 'node' else item['object']
                objectType = item['object']
                if 'bustype' in item and item['bustype'] == 'SWING':
                    objectType += ' swing'
                newVisItem['objectType'] = objectType
                newVisItem['name'] = item['name']
                nodes.append(newVisItem)
        visJson['nodes'] = nodes
        visJson['links'] = links
    return visJson
