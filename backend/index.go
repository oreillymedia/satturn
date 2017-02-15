package main

import (
	"fmt"
	"net/http"
)

func HTTPServeIndex(w http.ResponseWriter, r *http.Request) {
	// cookie := http.Cookie{Name: env.SessionSecret, Value: env.SessionSecret}
	// http.SetCookie(w, &cookie)
	index, _ := AppIndexHtml()
	fmt.Fprintf(w, string(index.bytes))
}
