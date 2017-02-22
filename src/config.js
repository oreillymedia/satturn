let config = {
oriole: {
  name: "Oriole Editor",
  message: "<p>Choose an editor from the menu on the left to <br/>adjust settings or edit the content.</p><p>All changes will be saved automatically.</p>",
  configFile: "oriole.json",
  configPath: "oriole-settings",
  defaultConfig: {
    "title": "Name",
    "source": "main.md",
    "mode": "markdown",
    "htmlContent": "main.html",
    "videoId": "",
    "cues": []
  },
  index:[
    {path: "markdown", name: "Markdown Editor",  editor: "markdown", 
      resources: [
        {type:'urlInProp', ref:'source'},
        {type:'urlInProp', ref:'htmlContent'}
      ]},
    {path: "annotator", name: "Cue Annotator",  editor: "ormAnnotator", 
      resources: [
        {type:'prop', ref:'cues'},
        {type:'urlInProp', ref:'htmlContent'}
      ]},
    {path: "oriole-settings", name: "Oriole Settings", editor: "json", 
      resources: [
        {type: 'url', path: "oriole.json"}
      ]},
    {path: "atlas-settings", name: "Atlas Settings", editor: "json", 
      resources: [
        {type: 'url', path:'atlas.json'}
      ]},
  ], 
},
atlas : {
  name: "Atlas Settings Editor",
  configFile: "atlas.json",
  configPath: "atlas-settings",
  defaultPath: "atlas-settings",
  defaultConfig: {

  },
  message: "<p>Click on Atlas Settings on the left to edit atlas.json.</p><p>All changes will be saved automatically.</p>",
  index:[
    {path: "atlas-settings", name: "Atlas Settings", editor: "json", 
      resources: [
        {type: 'url', path:'atlas.json'}
      ]},
  ]
}
}

export default config