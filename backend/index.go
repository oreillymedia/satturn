package main

import (
	"fmt"
	"net/http"
)

const INDEX_PAGE_TPL = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Oriole Editor</title>
  
  
  <link rel="stylesheet" href="app/assetslib/oreilly-theme.css">
  <link rel="stylesheet" href="app/assetsbundle.css">
  <link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body >
  <div id="container"></div>
  
  <!-- Thebe Dependencies -->
  <script src="app/assetslib/jquery-2.2.4.min.js"></script>
  <script src="app/assetslib/thebe.js"></script>
  <!-- The App -->
  <script src="app/assetsbundle.js"></script>
</body>
</html>
`

func HTTPServeIndex(w http.ResponseWriter, r *http.Request) error {
	fmt.Fprintf(w, INDEX_PAGE_TPL)
	return nil
}
