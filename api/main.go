package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"path/filepath"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
)

var root string = GetCwd() + "/../test-data/files"
var cwd string = GetCwd()

type Item struct {
	Parent   string  `json:"parent,omitempty"`
	Path     string  `json:"path"`
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Children []*Item `json:"children,omitempty"`
	Content  string  `json:"content,omitempty"`
}

func main() {

	r := mux.NewRouter()
	r.HandleFunc("/api/{path:.*}", ReadPath).Methods("GET")
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(cwd + "/..")))
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

func PathToItem(readPath string, level int) *Item {

	stat, err := os.Stat(readPath)
	if err != nil {
		fmt.Println("ERROR!")
	}
	relPath, _ := filepath.Rel(root, readPath)
	item := Item{
		Path: relPath,
		Name: stat.Name(),
		Type: "file",
	}

	if stat.IsDir() {
		level += 1
		item.Type = "directory"
		stats, _ := ioutil.ReadDir(readPath)
		for _, s := range stats {
			childItem := PathToItem(path.Join(readPath, s.Name()), level)
			childItem.Parent = item.Name
			item.Children = append(item.Children, childItem)
		}
	} else if level == 0 {
		content, _ := ioutil.ReadFile(path.Join(readPath))
		item.Content = string(content)
	}

	return &item
}

func ReadPath(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	readPath := path.Join(root, vars["path"])
	item := PathToItem(readPath, 0)
	data, _ := json.Marshal(item)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(data)
}

func GetCwd() string {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(dir)
	return dir
}
