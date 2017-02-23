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
        {
          type: 'url', 
          path:'atlas.json'
      }
      ],
      settings: {
          form: true,
          fields: { password: {type: 'password'} }
      },

    },
  ], 
},
atlas : {
  name: "Atlas Settings Editor",
  configFile: "atlas.json",
  configPath: "atlas-settings",
  defaultPath: "atlas-settings",
  defaultConfig: {
      "title": "title",
      "files": [
        "main.html"
      ],
      "formats": {
        "pdf": {
          "version": "web",
          "color_count": false,
          "index": false,
          "toc": false,
          "syntaxhighlighting": false,
          "show_comments": false,
          "trim_size": false
        },
        "epub": {
          "index": false,
          "toc": false,
          "epubcheck": false,
          "syntaxhighlighting": false,
          "show_comments": false,
          "downsample_images": false
        },
        "mobi": {
          "index": false,
          "toc": false,
          "syntaxhighlighting": false,
          "show_comments": false,
          "downsample_images": false
        },
        "html": {
          "index": false,
          "toc": false,
          "syntaxhighlighting": false,
          "show_comments": false,
          "consolidated": false
        }
      },
      "theme": "oreillymedia/atlas_tech1c_theme",
      "print_isbn13": "",
      "lang": "en",
      "accent_color": "",
      "templating": true,
      "branch": "master",
      
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