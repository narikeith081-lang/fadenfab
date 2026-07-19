package main

import (
	"fmt"
	"io"
	"net"
	"os"
)

func main() {
	port := ":8080"
	listener, err := net.Listen("tcp", port)
	if err != nil {
		fmt.Printf("Error starting server: %v\n", err)
		os.Exit(1)
	}
	defer listener.Close()

	fmt.Printf("TCP Echo Server running on port %s...\n", port)

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Printf("Error accepting connection: %v\n", err)
			continue
		}

		go handleConnection(conn)
	}
}

func handleConnection(conn net.Conn) {
	defer conn.Close()
	fmt.Printf("Client connected: %s\n", conn.RemoteAddr().String())

	_, err := io.Copy(conn, conn)
	if err != nil && err != io.EOF {
		fmt.Printf("Error handling connection from %s: %v\n", conn.RemoteAddr().String(), err)
	}

	fmt.Printf("Client disconnected: %s\n", conn.RemoteAddr().String())
}
