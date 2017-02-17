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

var root string = GetAppDir()

type Item struct {
	Parent   string  `json:"parent,omitempty"`
	Path     string  `json:"path"`
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Children []*Item `json:"children,omitempty"`
	Content  string  `json:"content,omitempty"`
}
type Response struct {
	Status     string `json:"status"`
	StatusCode int    `json:"statusCode"`
}

func main() {

	port := os.Getenv("PORT")
	if port == "" {
		port = "3300"
	}
	newRoot := os.Getenv("ROOT")
	if newRoot != "" {
		root = newRoot
	}

	r := mux.NewRouter()
	r.HandleFunc("/api/{path:.*}", ReadPath).Methods("GET")
	r.HandleFunc("/api/{path:.*}", WritePathToFile).Methods("POST")
	r.PathPrefix("/files/").Handler(http.StripPrefix("/files/", http.FileServer(http.Dir(root))))

	// Serve the index from assetsFS
	r.HandleFunc("/", HTTPServeIndex).Methods("GET")
	// serve the other files from assets FS
	r.PathPrefix("/").Handler(http.FileServer(assetFS()))

	n := negroni.Classic()
	n.UseHandler(r)

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

func WritePathToFile(w http.ResponseWriter, req *http.Request) {
	res := Response{
		Status:     "ok",
		StatusCode: 200,
	}
	vars := mux.Vars(req)
	filePath := path.Join(root, vars["path"])
	fileMode := os.FileMode(0644)
	content := req.FormValue("content")
	stat, err := os.Stat(filePath)
	if err != nil {
		res.Status = "file created"
		res.StatusCode = 201
	} else {
		fileMode = stat.Mode()
	}
	if content == "" {
		res.Status = "not ok"
		res.StatusCode = 400
		fmt.Println("ERROR!", "content is empty")
	} else {
		ioutil.WriteFile(filePath, []byte(content), fileMode)
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(res.StatusCode)
	}
	data, _ := json.Marshal(res)
	w.Write(data)
}

func GetAppDir() string {
	wd, err := os.Getwd()
	if err != nil {
		fmt.Println(err)
	}
	dir, err := filepath.Abs(wd)
	if err != nil {
		fmt.Println(err)
	}
	return dir
}
