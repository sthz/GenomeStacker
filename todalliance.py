# Name:       todalliance.py 
# Version:    0.2 (Development)
# Author:     Jurriaan Jansen
# Date:       20 may 2016 | 10 june -2016
# Function:   Generating files for a comparative web genome browser.
# Based on:   todalliance.perl (c) Roy Chaudhuri
#	
#
# How to use.
# example: python todalliance.py ./project ./genome1.gb ./compare1_2.m8 ./compare1_2_higher_depth.m8./genome2.gb ./compare2_3.m8 ./genome3.gb 


import sys, os
from os.path import basename
from Bio import SeqIO


def main():
  print("----------------------")
  #--Validation steps.
  path = determineOutputDirectory()
  genbankfiles = determineGenbankFile()
  m8files = determinM8Files()
  validateInputOrder()
  
  # To do
  # -bam files
  # -vcf files
  
  #--Generating files for dalliance browser.

  #generateDallianceFiles(genbankfiles,path)  
  #m8toJSON(m8files,path)
  generateIndex(path,genbankfiles,m8files)
  #getStaticFiles(path)

  print("----------------------")
  print("Dalliance build succesfull!")
  print("Upload the folder "+path+" and open the index.html")
  print("----------------------")


def generateIndex(path,genbankfiles,m8files):
  print("Generating index.html file")
  #The count makes sure the two arguments (todalliance.py & /output directory )are skipped in the determination of the dalliance index file generation.
  index = open(path+"/index.html","w")
  index.write(staticIndexInfo("head",m8files))  
  genbankfilecount = 0
  count = 0
  for i in sys.argv:    
    count += 1
    if count > 2:          
      if i.endswith(".catgb") or i.endswith(".gbk") or i.endswith(".gb"):
        index.write(htmlGenbank(i, genbankfilecount))
        genbankfilecount += 1
      elif i.endswith(".m8"):
        pass
       # elif i.endswith(".bam"):
       #   pass
       # elif i.endswith(".vcf"):
       #   pass
      else:
        print("ERROR: The file "+i+" is not yet compatible with this program.\n. todalliance ignored this file.")
  index.write(generateArrays(genbankfilecount,m8files))
  index.write(generateDIVS(genbankfilecount))
  index.write(staticIndexInfo("foot",m8files))
  index.close()


def generateDIVS(genbankfilecount):
  divs = "<div class='col-lg-12'>\n"
  for i in range (0,genbankfilecount):
    divs += ("\t<div id='dallianceBrowser_"+str(i+1)+"'>Dalliance here...</div>\n")
    if genbankfilecount != i+1: 
      divs += ("\t<div id='comparison_"+str(i+1)+"_"+str(i+2)+"' width=100% height='100'></div>\n")
  divs += "</div>"
  return(divs)


def generateArrays(genbankfilecount,m8files):
  dallianceBrowserPositions = []
  dallianceBrowsers = []
  for i in range(0,genbankfilecount):
    dallianceBrowserPositions.append("[(dallianceBrowser_"+str(i+1)+".viewStart | 0), (dallianceBrowser_"+str(i+1)+".viewEnd | 0)]")
    dallianceBrowsers.append("dallianceBrowser_"+str(i+1))
  c = 0
  comparisons = []
  jsonfiles = []
  for i in m8files:
    jsonfiles.append("'"+basename(i).replace(".m8",".json")+"'")
    comparisons.append("\"comparison_"+str(c+1)+"_"+str(c+2)+"\"")
    c += 1
  return("""
    var cache = [[]]
    var islistening = true;"""+"\n"+
    "var dallianceBrowsers = ["+",".join(dallianceBrowsers)+"]"+"\n"+
    "var jsonfiles = [["+",".join(jsonfiles)+"]]"+"\n"+
    "var comparisons = ["+",".join(comparisons)+"]"+"\n"+
    "var dallianceBrowserPositions = ["+",".join(dallianceBrowserPositions)+"]"+"""
    </script>
  """)
  
  
def htmlGenbank(f,genbankfilecount):
  filename = basename(f).replace(".catgb","").replace(".gbk","").replace(".gb","")
  gb_record = SeqIO.read(open(f,
    "r"), "genbank")   
  html = ("""
    var dallianceBrowser_"""+str(genbankfilecount+1)+""" = new Browser({
        chr: '"""+gb_record.name+"""',
        viewStart: 1,
        viewEnd: 40000,
        cookieKey: '"""+filename+"""',
        pageName: 'dallianceBrowser_"""+str(genbankfilecount+1)+"""',
        coordSystem: {
            speciesName: '"""+gb_record.description+"""',
            taxon: 511145,
            auth: '',
            version: ' '
        },
        disablePoweredBy: true,
        noPersist: true,
        toolbarBelow: false,
        maxViewWidth: """+str(len(gb_record.seq))+""",
        sources: [{
            name: 'Genome',
            twoBitURI: '"""+filename+""".2bit',
            tier_type: 'sequence',
            provides_entrypoints: true,
            pinned: false
        }, {
            name: 'Genes',
            bwgURI: '"""+filename+""".bb',
            tier_type: 'features',
            pinned: false,
            provides_search: true,
            trixURI: '"""+filename+""".ix',
            collapseSuperGroups: true,
            subtierMax: 1000,
            style: [{
                type: "default",
                zoom: "high",
                style: {
                    glyph: "ANCHORED_ARROW",
                    PARALLEL: true,
                    BUMP: false,
                    LABEL: false,
                    HEIGHT: 20,
                    BGITEM: true
                }
            }, {
                type: "default",
                zoom: "medium",
                style: {
                    glyph: "ANCHORED_ARROW",
                    PARALLEL: true,
                    BUMP: false,
                    LABEL: false,
                    HEIGHT: 20,
                    BGITEM: true
                }
            }, {
                type: "translation",
                zoom: "low",
                style: {
                    glyph: "BOX",
                    BUMP: false,
                    LABEL: false,
                    HEIGHT: 20,
                    BGITEM: true
                }
            }]
        }, ]
    });
    dallianceBrowser_"""+str(genbankfilecount+1)+""".addFeatureListener(function(event, feature, hit, tier) {
        featureListener(event, feature, hit, tier,dallianceBrowser_"""+str(genbankfilecount+1)+""")
    });
    dallianceBrowser_"""+str(genbankfilecount+1)+""".addViewListener(function() {
      if (islistening){
        islistening = false;
        viewListener(dallianceBrowser_"""+str(genbankfilecount+1)+""","""+str(genbankfilecount)+""")
          islistening = true;
      }
    });
    dallianceBrowser_"""+str(genbankfilecount+1)+""".addFeatureHoverListener(function(event, feature, hit, tier) {
        mouseOver(event, feature, hit, tier);
    });
    dallianceBrowser_"""+str(genbankfilecount+1)+""".addFeatureNonHoverListener(mouseOut);
    dallianceBrowser_"""+str(genbankfilecount+1)+""".disableDefaultFeaturePopup = true;
  """)
  if genbankfilecount != 0:
    html += "dallianceBrowser_"+str(genbankfilecount+1)+".noZoomSlider = true;"
  return (html)


def staticIndexInfo(argument,files):
  if argument == "head":
    return("""
      <!DOCTYPE html>
      <!-- Jquery -->
      <script src="https://code.jquery.com/jquery-2.1.3.min.js"></script>
      <!-- Latest compiled and minified CSS -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
      <!-- Optional theme -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">
      <!-- Latest compiled and minified JavaScript -->
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>

      <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css" rel="stylesheet">
      <script src="https://gitcdn.github.io/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min.js"></script>


      <html>
          <head>
              <title>JJCT</title>
          </head>
        <body>
          <div class="col-md-12 centered">
            <hr>
            <b> Settings </b>
            <hr>
            <button class="btn btn-primary" onclick="backToOverview()">Back to overview</button>
            <button class="btn btn-primary" onclick="makeCSVG()">makeSVG</button>
            <b>Lock browsers</b>
            <input type="checkbox" data-toggle="toggle" id="toggleBrowserButton" checked>
             <b>Show tooltip</b>
            <input type="checkbox" data-toggle="toggle" id="showTooltip" checked>
            <input type="search" id="setKonvaLayerHeight" placeholder="Set layer heigth"></input>
            <button class="btn btn-primary" onclick="setKonvaLayerHeight()">Set</button>
            <input type="search" id="setDesiredChangeRange" placeholder="Set desired change range"></input>
            <button class="btn btn-primary" onclick="setDesiredChangeRange()">Set</button>
            <button class="btn btn-primary" onclick="generateFastaFile()">display fasta file from selected sequences.</button>
            <br>
            <hr>
            <b> History </b>
             <button type="button" class="btn btn-default" aria-label="Left Align" onclick="historySave()">
                <span class="glyphicon glyphicon glyphicon-floppy-save" aria-hidden="true"></span>
            </button>
            <button type="button" class="btn btn-default" aria-label="Left Align" onclick="historyBack()">
                <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
            </button>
            <button type="button" class="btn btn-default" aria-label="Left Align" onclick="historyForward()">
                <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
            </button>
          </div>

      <script language="javascript" src="dalliance-all.js"></script>
      <script language="javascript" src="konva.min.js"></script>
      <script language="javascript" src="wz_tooltip.js"></script>
      <script language="javascript" src="datadumper.js"></script>
      <script language="javascript" src="browser.js"></script>
      <script language="javascript">
    """)
  elif argument == "foot":
    return("""
      <script language="javascript">
        refreshBrowser()
        loadPageFromURL()
      </script>

      </body>


      </html>
    """)

  
def validateInputOrder():
  pass
  

def getStaticFiles(path):
  print("Copying static javscript files")
  command = ("cp "+os.getcwd()+"/static_files/*.js "+path)
  os.system(command)
  #Check if all the files are present in the /static_files folder.
  staticfileslist = ["browser.js","dalliance-all.js","datadumper.js","konva.min.js","wz_tooltip.js"]
  for i in staticfileslist:
    if  os.path.exists(path+"/"+i) == False:
      print("ERROR: The file '"+i+"' is missing from the ./static_files folder.")
      quit()
      

def generateDallianceFiles(files,path):
  for i in files:
    filename = basename(i).replace(".catgb","").replace(".gbk","").replace(".gb","")
    print("Generating files for "+filename)
    #Generating .fasta file.
    gb2fasta = ("gb2fasta "+os.path.abspath(i)+" > "+path+"/"+filename+".fasta")
    os.system(gb2fasta)
    if  os.path.exists(path+"/"+filename+".fasta") == False:
      print("ERROR: .fasta file NOT created\nThe program 'faToTwoBit' may not be installed")
      quit()  
 
    #Generating 2bit file.
    faToTwoBit = ("faToTwoBit "+path+"/"+filename+".fasta "+path+"/"+filename+".2bit")
    os.system(faToTwoBit)
    if  os.path.exists(path+"/"+filename+".2bit") == False:
      print("ERROR: 2bit file NOT created\nThe program 'faToTwoBit' may not be installed")
      quit()   
      
    #Generating bigbed file.
    gb2bigbed = ("gb2bigbed "+os.path.abspath(i)+" -o "+path)
    os.system(gb2bigbed)
    if  os.path.exists(path+"/"+filename+".bb") == False:
      print("ERROR: Bigbed could not be created\n")
      quit()


def m8toJSON(m8files,path):
  for i in m8files:
    f = open(i,"r")
    filename = basename(i).replace(".m8",".json")
    o = open(path+"/"+filename,"w")
    o.write("[")
    iteration = 1
    for line in f:
        split = line.split("\t")
        if iteration == 1:
            o.write('{"rstart":"'+split[8]+'","rend":"'+split[9]+'","qstart":"'+split[6]+'","qend":"'+split[7]+'","id":"'+split[2]+'","sim":"0.00"}')
        else:
            o.write(',{"rstart":"'+split[8]+'","rend":"'+split[9]+'","qstart":"'+split[6]+'","qend":"'+split[7]+'","id":"'+split[2]+'","sim":"0.00"}')
        iteration += 1
    o.write("]")
    o.close()
    f.close()


def determineOutputDirectory():
  if os.path.exists(sys.argv[1]):
    return (sys.argv[1])
  else:
    print("ERROR: Directory ",(sys.argv[1])," does not exist.")
    quit()


def determineGenbankFile():
  gbfiles= [];
  for i in sys.argv:
    if i.endswith(".catgb") or i.endswith(".gbk") or i.endswith(".gb"):
      gbfiles.append(i)
  if len(gbfiles) == 0:
    print("ERROR: No genbank file given.")
    quit()
  elif len(gbfiles) == 1:
    print("ERROR: Only 1 genbank file given.")
    quit()
  elif len(gbfiles) >=2:
    return gbfiles 


def determinM8Files():
  m8files= []
  for i in sys.argv:
    if i.endswith(".m8"):
      m8files.append(i)
  if len(m8files) == 0:
    print("ERROR: No .m8 file(s) given.")
    quit()
  elif len(m8files) >=1:
    return m8files


if len(sys.argv) == 1:
  print("Instructions: \n Version: 0.1 (Development)\n Input: \n Example input: python todalliance.py ./project ./genome1.gb ./compare1_2.m8 ./genome2.gb ")
  quit() 
else:
  main()