package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

func main() {
	fmt.Println("Hello, MJPM Booking Platform!")

	// Initialize router
	r := mux.NewRouter()

	// Define a simple handler
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Welcome to the MJPM Booking Platform!")
	})

	// Initialize database connection
	db, err := gorm.Open("mysql", "root:secret@tcp(127.0.0.1:3306)/booking_platform?charset=utf8&parseTime=True&loc=Local")
	if err != nil {
		fmt.Println("Failed to connect to database:", err)
		return
	}
	defer db.Close()

	// Start the server
	http.ListenAndServe(":8080", r)
}
