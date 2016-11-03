package main

import (
	"encoding/json"
	"net/http"
	"os"
  "fmt"
  "io/ioutil"
  "path"

	"github.com/codegangsta/negroni"
  "github.com/gorilla/mux"
)

var root string = "/Users/runemadsen"

type Item struct {
	Parent     string  `json:"parent,omitempty"`
	Path       string `json:"path"`
	Name       string `json:"name"`
  Type       string `json:"type"`
	Children   []*Item `json:"children,omitempty"`
  Content    string `json:"content,omitempty"`
}

func main() {

	r := mux.NewRouter()
  r.HandleFunc("/api/{path:.*}", ReadPath).Methods("GET")
	//r.HandleFunc("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(".."))))
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("..")))

	n := negroni.Classic()
	n.UseHandler(r)

  port := os.Getenv("PORT")
	if port == "" {
		port = "3300"
	}

  newRoot := os.Getenv("ROOT")
  if newRoot != "" {
    root = newRoot
  }

	n.Run(":" + port)
}

func PathToItem(readPath string) *Item {

  stat, err := os.Stat(readPath)
  if(err != nil) {
    fmt.Println("ERROR!")
  }

  item := Item{
    Path: readPath,
    Name: stat.Name(),
    Type: "file",
  }

  if stat.IsDir() {
    item.Type = "directory"
    stats, _ := ioutil.ReadDir(readPath)
    for _, s := range stats {
      childItem := PathToItem(path.Join(readPath, s.Name()))
      childItem.Parent = item.Name
      item.Children = append(item.Children, childItem)
	  }
  } else {
		content, _ := ioutil.ReadFile(path.Join(readPath))
		item.Content = string(content)
	}

  return &item
}

func ReadPath(w http.ResponseWriter, req *http.Request) {

  vars := mux.Vars(req)
  readPath := path.Join(root, vars["path"])

  item := PathToItem(readPath)

  data, _ := json.Marshal(item)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(data)
}
