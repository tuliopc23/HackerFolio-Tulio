package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New(fiber.Config{
		Prefork: false,
	})

	// Middleware
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${method} ${path} ${status} - ${latency}\n",
	}))
	
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173,http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Health check endpoint
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "ok",
			"timestamp": time.Now().Format(time.RFC3339),
			"uptime":    time.Since(startTime).Seconds(),
		})
	})

	// Portfolio data endpoints
	app.Get("/api/profile", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"name":     "Tulio Cunha",
			"title":    "Full-stack Developer",
			"location": "Remote",
			"status":   "Available for projects",
		})
	})

	app.Get("/api/projects", func(c *fiber.Ctx) error {
		projects := []fiber.Map{
			{
				"id":          "1",
				"name":        "Terminal Portfolio",
				"description": "A vintage CRT-inspired portfolio website with interactive terminal interface.",
				"stack":       []string{"React", "TypeScript", "Tailwind"},
				"featured":    true,
			},
		}
		return c.JSON(projects)
	})

	// Terminal command logging endpoint
	app.Post("/api/terminal/log", func(c *fiber.Ctx) error {
		var body struct {
			Command   string    `json:"command"`
			Timestamp time.Time `json:"timestamp"`
		}
		
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}
		
		log.Printf("Terminal command: %s at %v\n", body.Command, body.Timestamp)
		return c.JSON(fiber.Map{"logged": true})
	})

	port := "8080"
	log.Printf("Fiber server starting on port %s\n", port)
	log.Fatal(app.Listen(":" + port))
}

var startTime = time.Now()