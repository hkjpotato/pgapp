#omf parser for glm
from .omfcode import parse, fullyDeEmbed
#omf writeback function from json to glm
from .omfcode import write, sortedWrite
#Attention: The function to create folder and file is not here. This file only deal with data in memory
import json
'''
ImportGLM provides function to parse the glm file into
a "fullyDeEmbed" json, which means you won't have nested json object in the output

Notice
1. The comment will be stripped from the source glm
2. The output json contains a key-value structure. 
   The key is the 'location' of that information in the original glm file.

* It is important to maintain the order of these keys, as it will be used
  to convert json back to glm file
  (check the 'sortedWrite' function in the line#25 in omfcode.py)

* This parser does not deal with the 'colon naming' problem.
'''

'''
Root Function, import glm(based on a given path) in memory 
and return it
'''
def ImportGLM(glm_file_path):
    pythonDict = loadGlmInMemory(glm_file_path)
    return pythonDict

'''
Main function to load glm in memory
1. load the glm file into a python dictionary based on a given file path, 
2. use fullyDeEmbed function to 'DeEmbed' the generated 
'''
def loadGlmInMemory(glm_file_path):
    # parse the raw glm into python dictionary, in omf, it calls it a 'tree'
    omfTree = parse(glm_file_path, filePath=True)
    # flat the omfTree
    fullyDeEmbed(omfTree)
    return omfTree

'''
exportGLM provides function to convert the json file back into
a glm file

Notice
The 'sortedWrite' function it uses from the omfcode will sort the order of input data
based on their 'key' value.

Check line#25 in omfcode.py to see the reason behind it.
'''

'''
Root Function, load json(based on a given path) and return glm as String
'''
def ExportGLM(json_file_path):
    with open(json_file_path, 'r') as inFile:
        pythonDict = json.load(inFile) 
    #get the text string of the glm
    glmString = sortedWrite(pythonDict)
    return glmString



