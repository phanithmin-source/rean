import { getDb } from "./index";
import bcrypt from "bcryptjs";
import { ensurePhysicalSeedAssets } from "../services/assets-generator";

export async function seedDatabase() {
  console.log("Starting Rean database seeding...");
  const db = await getDb();

  // 1. Physical Assets & Assets table
  const { pdfSize, zipSize } = await ensurePhysicalSeedAssets();

  const pdfAssetId = "asset-pdf-java-handbook";
  const zipAssetId = "asset-zip-study-tracker";

  await db.query(
    `INSERT INTO assets (id, filename, original_name, mime_type, byte_size, storage_path, public_url, is_draft_only)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO NOTHING`,
    [
      pdfAssetId,
      "practical-java-handbook.pdf",
      "Practical Java for Modern Developers.pdf",
      "application/pdf",
      pdfSize,
      "/uploads/practical-java-handbook.pdf",
      "/uploads/practical-java-handbook.pdf",
      false,
    ]
  );

  await db.query(
    `INSERT INTO assets (id, filename, original_name, mime_type, byte_size, storage_path, public_url, is_draft_only)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO NOTHING`,
    [
      zipAssetId,
      "study-session-tracker.zip",
      "study-session-tracker-starter.zip",
      "application/zip",
      zipSize,
      "/uploads/study-session-tracker.zip",
      "/uploads/study-session-tracker.zip",
      false,
    ]
  );

  // 2. Default Admin Account
  const existingAdmin = await db.query(
    "SELECT id FROM admins WHERE email = $1",
    ["admin@rean.dev"]
  );

  if (existingAdmin.rows.length === 0) {
    const passwordHash = await bcrypt.hash("AdminPassword123!", 10);
    await db.query(
      `INSERT INTO admins (id, email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ["admin-01", "admin@rean.dev", passwordHash, "Rean Lead Editor", "admin"]
    );
    console.log("Seeded default admin: admin@rean.dev");
  }

  // 3. Topics (Programming, Frontend, Backend, Databases, Developer Tools)
  const topicsToSeed = [
    {
      id: "topic-programming",
      slug: "programming",
      name: "Programming",
      description:
        "Language syntax, data structures, algorithms, and core object-oriented and functional paradigms.",
      icon: "Code2",
      display_order: 1,
    },
    {
      id: "topic-frontend",
      slug: "frontend",
      name: "Frontend",
      description:
        "Modern web standards, semantic HTML, responsive CSS, client-side frameworks, and UX performance.",
      icon: "Layout",
      display_order: 2,
    },
    {
      id: "topic-backend",
      slug: "backend",
      name: "Backend",
      description:
        "Server-side architectures, REST and GraphQL APIs, distributed messaging, and business logic layers.",
      icon: "Server",
      display_order: 3,
    },
    {
      id: "topic-databases",
      slug: "databases",
      name: "Databases",
      description:
        "Relational schema modeling, SQL query optimization, indexes, transactions, and ACID principles.",
      icon: "Database",
      display_order: 4,
    },
    {
      id: "topic-developer-tools",
      slug: "developer-tools",
      name: "Developer Tools",
      description:
        "Git version control, Linux CLI environments, containerization, debugging utilities, and CI/CD.",
      icon: "Wrench",
      display_order: 5,
    },
  ];

  for (const topic of topicsToSeed) {
    const existing = await db.query(
      "SELECT id FROM topics WHERE slug = $1",
      [topic.slug]
    );
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO topics (id, slug, name, description, icon, display_order, is_visible, status, draft_name, draft_description, draft_icon, draft_display_order, draft_is_visible, has_draft_changes)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, 'published', $3, $4, $5, $6, TRUE, FALSE)`,
        [
          topic.id,
          topic.slug,
          topic.name,
          topic.description,
          topic.icon,
          topic.display_order,
        ]
      );
    }
  }

  // 4. Resources
  const resourcesToSeed = [
    {
      id: "res-java-programming",
      slug: "java-programming",
      title: "Practical Java for Modern Developers",
      summary:
        "A comprehensive, production-focused guide to modern Java. Covers language fundamentals, OOP, streams, concurrency with virtual threads, and clean REST architecture.",
      description_markdown: `## Overview

Java remains one of the world's most resilient and widely deployed programming ecosystems. This comprehensive handbook takes you from essential object-oriented fundamentals through to Java 21+ features including records, pattern matching, virtual threads (Project Loom), and enterprise service architecture.

### Who this resource is for
- Computer science students building strong OOP fundamentals.
- Early-career developers preparing for backend and enterprise engineering roles.
- Engineers migrating to modern Java (Java 17 / 21) from legacy versions.

### When to use this guide
Use this handbook when designing maintainable backend services, preparing for technical interviews on object-oriented system design, or building asynchronous systems that require scalable I/O.

### Available Actions & Learning Options
- **Read Online**: Explore the complete 5-chapter interactive guide with syntax-highlighted code.
- **Download PDF**: Grab the offline handbook for study on tablets and e-readers.
- **View & Download Source**: Examine the reference implementation of the Study Session Tracker project archive.`,
      type: "book",
      difficulty: "beginner",
      topic_id: "topic-programming",
      tags: JSON.stringify(["java", "oop", "virtual-threads", "rest-api", "streams"]),
      source_url: "https://docs.oracle.com/en/java/",
      curation_note:
        "Curated as Rean's flagship launch resource. Completely structured for beginner-to-intermediate developers with accompanying runnable code.",
      download_asset_id: pdfAssetId,
      featured_order: 1,
      has_chapters: true,
    },
    {
      id: "res-frontend-fundamentals",
      slug: "modern-frontend-fundamentals",
      title: "Frontend Fundamentals: HTML, Modern CSS & JavaScript",
      summary:
        "Master the essential web trio. Learn semantic document structure, accessible components, CSS Grid/Flexbox layouts, and modern ECMAScript.",
      description_markdown: `## Master Modern Frontend Foundations

The modern web is built upon three core standards: semantic HTML5, expressive modern CSS, and ECMAScript. This guide emphasizes clean architecture without relying on frameworks prematurely.

### Key Pillars Covered
- **Semantic HTML5**: Semantic elements (<header>, <main>, <article>, <section>), accessibility landmarks, and form validation.
- **Modern CSS Layouts**: Mastering Flexbox and CSS Grid, responsive design tokens, container queries, and CSS custom properties.
- **Modern JavaScript**: Scoping (let/const), arrow functions, destructuring, Promises, async/await, and DOM manipulation.

### Who this is for
Aspiring web developers, students building their first portfolio, and developers seeking deep mastery of browser fundamentals.`,
      type: "guide",
      difficulty: "beginner",
      topic_id: "topic-frontend",
      tags: JSON.stringify(["html", "css", "javascript", "dom", "accessibility"]),
      source_url: "https://developer.mozilla.org/en-US/docs/Learn",
      curation_note:
        "Carefully adapted for Cambodian learners starting web engineering. Emphasizes browser devtools and standard web semantics.",
      download_asset_id: null,
      featured_order: 2,
      has_chapters: false,
    },
    {
      id: "res-rest-api-design",
      slug: "restful-api-design-guide",
      title: "RESTful API Design & Best Practices",
      summary:
        "Practical standards for building scalable, predictable HTTP APIs. Covers URL structure, JSON schemas, authentication, rate limiting, and versioning.",
      description_markdown: `## Predictable & Resilient REST APIs

Building APIs that other developers love using requires clear conventions and disciplined design.

### Core Architecture Concepts
1. **Resource-Oriented URIs**: Nouns instead of verbs (\`/api/sessions\`, \`/api/resources/:id\`).
2. **Standard HTTP Verbs**: \`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\` with strict idempotent semantics.
3. **Meaningful HTTP Status Codes**: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error.
4. **Structured Error Payloads**: RFC 7807 problem details with clear error codes and actionable field messages.
5. **Pagination & Filtering**: Consistent query parameter schemes (\`limit\`, \`offset\`, \`cursor\`, \`sort\`).

### Practice Reference
This guide provides the architectural blueprint for the Study Session Tracker backend API.`,
      type: "guide",
      difficulty: "beginner",
      topic_id: "topic-backend",
      tags: JSON.stringify(["rest-api", "http", "json", "backend", "architecture"]),
      source_url: "https://restfulapi.net/",
      curation_note:
        "Essential reading before beginning the Backend Foundations learning path. Based on production API guidelines.",
      download_asset_id: null,
      featured_order: 3,
      has_chapters: false,
    },
    {
      id: "res-sql-relational-databases",
      slug: "practical-sql-relational-databases",
      title: "Practical Relational Databases & SQL Mastery",
      summary:
        "From schema design and third normal form to complex JOINs, indexing strategies, transactions, and ACID guarantees using PostgreSQL.",
      description_markdown: `## The Solid Foundation of Persistent Data

Applications live and die by their data layer. This resource teaches you how to think in relations and write performant, reliable SQL queries.

### What You Will Learn
- **Relational Data Modeling**: Tables, primary keys, foreign keys, normalization (1NF, 2NF, 3NF), and entity relationships.
- **Data Querying**: Inner joins, left/right outer joins, aggregations (\`GROUP BY\`, \`HAVING\`), subqueries, and window functions.
- **Data Integrity & Constraints**: \`UNIQUE\`, \`CHECK\`, \`NOT NULL\`, and \`ON DELETE CASCADE/SET NULL\`.
- **Indexing & Performance**: B-Tree indexes, composite indexes, query plans (\`EXPLAIN ANALYZE\`), and table scans.
- **Transactions & ACID**: Atomicity, Consistency, Isolation, and Durability under concurrent workloads.`,
      type: "course",
      difficulty: "beginner",
      topic_id: "topic-databases",
      tags: JSON.stringify(["sql", "postgresql", "indexing", "relational-design", "acid"]),
      source_url: "https://www.postgresql.org/docs/",
      curation_note:
        "PostgreSQL-centered practical reference with realistic schema blueprints for real software applications.",
      download_asset_id: null,
      featured_order: 4,
      has_chapters: false,
    },
    {
      id: "res-git-fundamentals",
      slug: "git-fundamentals-to-branching",
      title: "Git Fundamentals & Team Collaboration Strategies",
      summary:
        "Demystifies git internals: commits, staging, branches, remotes, rebase vs merge, and pull request workflows in team settings.",
      description_markdown: `## Version Control for Confident Developers

Git is the fundamental nervous system of collaborative software development. Rather than memorizing commands blindly, understand the underlying directed acyclic graph (DAG).

### Topics Covered
- **The Three Trees**: Working directory, staging index, and HEAD repository commit history.
- **Branching & Merging**: Feature branches, merge commits vs interactive rebase, and fast-forward merging.
- **Remote Collaboration**: Pushing, pulling, fetch vs pull, tracking upstream remotes, and code review workflows.
- **Undo & Recovery**: \`git checkout\`, \`git restore\`, \`git stash\`, \`git revert\`, and recovering lost work with \`git reflog\`.`,
      type: "tool",
      difficulty: "beginner",
      topic_id: "topic-developer-tools",
      tags: JSON.stringify(["git", "github", "version-control", "collaboration", "cli"]),
      source_url: "https://git-scm.com/doc",
      curation_note:
        "Features visual branch diagrams and practical troubleshooting commands for everyday developer roadblocks.",
      download_asset_id: null,
      featured_order: 5,
      has_chapters: false,
    },
    {
      id: "res-curated-postgresql-docs",
      slug: "postgresql-documentation",
      title: "PostgreSQL Official Documentation",
      summary:
        "The authoritative reference manual for PostgreSQL: SQL syntax, JSON types, full-text search, and administration.",
      description_markdown: `PostgreSQL is widely considered the most advanced open-source object-relational database system. Its official documentation is legendary for its accuracy and depth.`,
      type: "documentation",
      difficulty: "intermediate",
      topic_id: "topic-databases",
      tags: JSON.stringify(["postgresql", "database", "docs"]),
      source_url: "https://www.postgresql.org/docs/current/",
      curation_note:
        "Hand-picked for developers wanting direct reference material on PostgreSQL functions, operators, and indexes.",
      download_asset_id: null,
      featured_order: null,
      has_chapters: false,
    },
    {
      id: "res-curated-docker-guide",
      slug: "docker-for-developers",
      title: "Docker Curriculum for Web Developers",
      summary:
        "A practical, hands-on introduction to containerizing applications, writing Dockerfiles, and orchestrating multi-container services with Docker Compose.",
      description_markdown: `Learn how containers solve the 'works on my machine' dilemma. Covers Docker images, layers, volumes for database persistence, and network bridges.`,
      type: "guide",
      difficulty: "beginner",
      topic_id: "topic-developer-tools",
      tags: JSON.stringify(["docker", "containers", "devops"]),
      source_url: "https://docker-curriculum.com/",
      curation_note:
        "One of the clearest no-nonsense introductions to container basics, perfect for students deploying backend APIs.",
      download_asset_id: null,
      featured_order: null,
      has_chapters: false,
    },
  ];

  for (const res of resourcesToSeed) {
    const existing = await db.query(
      "SELECT id FROM resources WHERE slug = $1",
      [res.slug]
    );

    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO resources (
          id, slug, title, summary, description_markdown, type, difficulty,
          topic_id, tags, source_url, curation_note, download_asset_id,
          featured_order, status, published_at,
          draft_title, draft_summary, draft_description_markdown, draft_type, draft_difficulty,
          draft_topic_id, draft_tags, draft_source_url, draft_curation_note, draft_download_asset_id,
          draft_featured_order, has_draft_changes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, 'published', CURRENT_TIMESTAMP,
          $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, FALSE
        )`,
        [
          res.id,
          res.slug,
          res.title,
          res.summary,
          res.description_markdown,
          res.type,
          res.difficulty,
          res.topic_id,
          res.tags,
          res.source_url,
          res.curation_note,
          res.download_asset_id,
          res.featured_order,
        ]
      );
    }
  }

  // 5. Java Book Chapters
  const javaResource = await db.query(
    "SELECT id FROM resources WHERE slug = $1",
    ["java-programming"]
  );

  if (javaResource.rows.length > 0) {
    const javaResourceId = javaResource.rows[0].id;

    const chaptersToSeed = [
      {
        slug: "01-modern-java-and-oop-foundations",
        title: "1. Modern Java & Object-Oriented Foundations",
        order: 1,
        content: `## Modern Java & OOP Foundations

Welcome to the first chapter of **Practical Java for Modern Developers**. In this chapter, we explore modern Java syntax (Java 17 & 21), object-oriented design principles, and how modern language features make code more expressive and maintainable.

### The Evolution of Java

Java has evolved rapidly over recent releases, introducing features that dramatically reduce boilerplate while preserving type safety:

- **Type Inference with \`var\`**: Local variable type inference keeps declarations concise.
- **Records**: Transparent, immutable data carriers.
- **Pattern Matching**: Type patterns with \`instanceof\` and \`switch\` expressions.
- **Text Blocks**: Multi-line strings without tedious concatenation.

### Code Example: Record vs Traditional Class

Notice how concise modern Java is when declaring immutable domain objects:

\`\`\`java
package dev.rean.models;

import java.time.Instant;
import java.util.Objects;

/**
 * Immutable Record representing a developer's learning session.
 */
public record StudyLog(
    String id,
    String topic,
    int minutesSpent,
    Instant timestamp
) {
    // Compact constructor for validation
    public StudyLog {
        Objects.requireNonNull(topic, "Topic must not be null");
        if (minutesSpent <= 0) {
            throw new IllegalArgumentException("Study minutes must be positive");
        }
    }

    public boolean isExtendedSession() {
        return minutesSpent >= 60;
    }
}
\`\`\`

### Object-Oriented Principles in Practice

1. **Encapsulation**: Guard internal state. Prefer immutability by default.
2. **Polymorphism**: Program to interfaces (\`List\`, \`Set\`, \`Map\`, custom domain services) rather than concrete implementations.
3. **Composition Over Inheritance**: Assemble complex behaviors through collaborating components rather than deep inheritance hierarchies.

### Pattern Matching with Switch

Modern Java allows elegant branching over sealed types and records:

\`\`\`java
public static String formatSessionSummary(Object event) {
    return switch (event) {
        case StudyLog log when log.minutesSpent() > 90 -> 
            "Intensive study: " + log.topic() + " (" + log.minutesSpent() + "m)";
        case StudyLog log -> 
            "Standard study: " + log.topic();
        case null -> "No session recorded";
        default -> "Unknown event: " + event.toString();
    };
}
\`\`\`

In the next chapter, we will leverage these objects within the **Collections Framework and Streams API**.`,
      },
      {
        slug: "02-collections-and-streams-api",
        title: "2. Collections Framework, Generics & Streams API",
        order: 2,
        content: `## Collections Framework, Generics & Streams API

Data structures and functional transformations form the backbone of modern data processing in Java.

### The Collections Hierarchy

Java provides high-performance collections in \`java.util\`:

- **\`List<T>\`**: Ordered sequences (\`ArrayList\` for fast random access, \`LinkedList\` for frequent head/tail insertions).
- **\`Set<T>\`**: Unique elements (\`HashSet\` for O(1) lookups, \`TreeSet\` for sorted order).
- **\`Map<K, V>\`**: Key-value associations (\`HashMap\` for O(1) key lookups, \`ConcurrentHashMap\` for thread-safe access).

### Unmodifiable Collections Factory Methods

Java provides lightweight factory methods to create immutable collections:

\`\`\`java
List<String> topics = List.of("Java", "PostgreSQL", "Docker", "REST API");
Set<String> uniqueTags = Set.of("backend", "database", "tools");
Map<String, Integer> studyGoals = Map.of(
    "Java", 120,
    "PostgreSQL", 90
);
\`\`\`

### Declarative Pipelines with Streams

The Streams API lets developers express data transformations cleanly using functional composition (\`filter\`, \`map\`, \`flatMap\`, \`reduce\`, \`collect\`):

\`\`\`java
package dev.rean.analytics;

import dev.rean.models.StudyLog;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AnalyticsEngine {

    public static Map<String, Integer> calculateMinutesPerTopic(List<StudyLog> logs) {
        return logs.stream()
            .filter(log -> log.minutesSpent() > 0)
            .collect(Collectors.groupingBy(
                StudyLog::topic,
                Collectors.summingInt(StudyLog::minutesSpent)
            ));
    }

    public static List<String> getTopPracticedTopics(List<StudyLog> logs, int minMinutes) {
        return logs.stream()
            .filter(log -> log.minutesSpent() >= minMinutes)
            .map(StudyLog::topic)
            .distinct()
            .sorted()
            .toList();
    }
}
\`\`\`

### Streams vs Loops: When to Use Which
- Use **Streams** for data transformation, filtering, grouping, and parallel transformations.
- Use traditional **loops** when early exit (\`break\`), complex state mutation, or checked exceptions are central to the algorithm.`,
      },
      {
        slug: "03-concurrency-and-virtual-threads",
        title: "3. Concurrency, Virtual Threads & Async I/O",
        order: 3,
        content: `## Concurrency, Virtual Threads & Async I/O

With Java 21, **Virtual Threads (Project Loom)** radically simplified high-throughput concurrent programming.

### Platform Threads vs Virtual Threads

Historically, Java platform threads mapped 1:1 to Operating System kernel threads. Because OS threads consume significant memory (typically ~1MB stack) and require expensive context switching, developers had to use complex reactive asynchronous frameworks (like WebFlux, RxJava) to handle thousands of concurrent connections.

**Virtual Threads** change the equation:
- Managed by the JVM runtime rather than the OS.
- Millions of virtual threads can run simultaneously with minimal memory overhead.
- When a virtual thread performs blocking I/O (e.g. database query, HTTP call), the JVM unmounts it from the carrier OS thread, freeing the carrier thread to execute other virtual threads!

### Creating Virtual Threads

\`\`\`java
package dev.rean.concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class VirtualThreadDemo {

    public static void runConcurrently() {
        // Creates an ExecutorService that starts a new virtual thread for each task
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 1; i <= 10_000; i++) {
                final int taskId = i;
                executor.submit(() -> {
                    // Simulating network or database latency
                    Thread.sleep(100);
                    System.out.println("Finished task " + taskId + " on " + Thread.currentThread());
                    return taskId;
                });
            }
        } // Automatically waits for all tasks to complete upon close!
    }
}
\`\`\`

### Best Practices with Virtual Threads
1. **Do Not Pool Virtual Threads**: Platform threads are pooled because they are expensive; virtual threads are cheap and short-lived. Create one per task!
2. **Avoid Long Synchronized Blocks**: Prefer \`ReentrantLock\` over \`synchronized\` to avoid pinning carrier threads during blocking operations.
3. **Write Simple Blocking Code**: Write clean, synchronous, readable sequential code instead of convoluted callback chains.`,
      },
      {
        slug: "04-rest-services-and-architecture",
        title: "4. Building Robust REST Endpoints & Service Layers",
        order: 4,
        content: `## Building Robust REST Endpoints & Service Layers

In this chapter, we assemble our components into a production-grade RESTful API service.

### Layered Architecture

A clean backend separates concerns into distinct layers:

1. **Controller Layer**: Handles HTTP requests, deserializes JSON, validates input, and returns HTTP responses.
2. **Service Layer**: Contains business logic, calculations, transaction boundaries, and orchestration.
3. **Repository Layer**: Interacts with PostgreSQL database or persistence engines.
4. **Data Transfer Objects (DTOs)**: Isolate internal database entities from external API contracts.

### REST Controller Implementation

\`\`\`java
package dev.rean.tracker.web;

import dev.rean.tracker.service.SessionService;
import dev.rean.tracker.dto.CreateSessionRequest;
import dev.rean.tracker.dto.SessionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/study-sessions")
public class StudySessionController {

    private final SessionService sessionService;

    public StudySessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public List<SessionResponse> listSessions(
        @RequestParam(defaultValue = "all") String topic
    ) {
        return sessionService.getSessions(topic);
    }

    @PostMapping
    public ResponseEntity<SessionResponse> recordSession(
        @Valid @RequestBody CreateSessionRequest request
    ) {
        SessionResponse created = sessionService.recordSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSessionById(@PathVariable String id) {
        return sessionService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
\`\`\`

### Global Error Handling

Never leak raw stack traces to API consumers. Use \`@ControllerAdvice\` with RFC 7807 problem details:

\`\`\`java
package dev.rean.tracker.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            ex.getMessage()
        );
        problem.setTitle("Invalid Request Parameters");
        problem.setType(URI.create("https://rean.dev/errors/bad-request"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
\`\`\``,
      },
      {
        slug: "05-testing-and-deployment",
        title: "5. Unit Testing with JUnit 5 & Practical Patterns",
        order: 5,
        content: `## Unit Testing with JUnit 5 & Practical Patterns

Reliable software cannot exist without automated verification. In this concluding chapter, we implement unit tests, mock external dependencies, and prepare the project for deployment.

### The Testing Pyramid
- **Unit Tests (JUnit 5)**: Fast, isolated verification of business logic algorithms and domain invariants.
- **Integration Tests (MockMvc / Testcontainers)**: Verifies controller endpoints, JSON serialization, and SQL database queries.
- **End-to-End Tests**: Complete workflows from client to server.

### Writing Expressive Unit Tests

\`\`\`java
package dev.rean.tracker.service;

import dev.rean.tracker.dto.CreateSessionRequest;
import dev.rean.tracker.dto.SessionResponse;
import dev.rean.tracker.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SessionServiceTest {

    private SessionRepository repository;
    private SessionService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(SessionRepository.class);
        service = new SessionService(repository);
    }

    @Test
    @DisplayName("Should successfully record a valid study session")
    void testRecordValidSession() {
        CreateSessionRequest request = new CreateSessionRequest("Java", 75, "Studied virtual threads");
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SessionResponse result = service.recordSession(request);

        assertNotNull(result);
        assertEquals("Java", result.topic());
        assertEquals(75, result.minutesSpent());
        verify(repository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should reject study sessions with non-positive duration")
    void testRejectZeroDuration() {
        CreateSessionRequest invalid = new CreateSessionRequest("Java", 0, "Invalid duration");

        assertThrows(IllegalArgumentException.class, () -> {
            service.recordSession(invalid);
        });
        verify(repository, never()).save(any());
    }
}
\`\`\`

### Packaging & Executing
To build and verify the application locally or in CI:

\`\`\`bash
# Run all tests
./mvnw clean test

# Build production JAR
./mvnw clean package -DskipTests=false
\`\`\`

Congratulations on completing the **Practical Java for Modern Developers** guide! Explore the **Backend Foundations** learning path next to apply these patterns to the final practice project.`,
      },
    ];

    for (const ch of chaptersToSeed) {
      const existing = await db.query(
        "SELECT id FROM chapters WHERE resource_id = $1 AND slug = $2",
        [javaResourceId, ch.slug]
      );

      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO chapters (
            id, resource_id, slug, title, chapter_order, content_markdown,
            status, draft_title, draft_content_markdown, draft_chapter_order, has_draft_changes
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            'published', $4, $6, $5, FALSE
          )`,
          [
            `ch-java-${ch.order}`,
            javaResourceId,
            ch.slug,
            ch.title,
            ch.order,
            ch.content,
          ]
        );
      }
    }
  }

  // 6. Learning Paths
  const pathsToSeed = [
    {
      id: "path-programming-foundations",
      slug: "programming-foundations",
      title: "Programming Foundations",
      summary:
        "A disciplined start to coding. Learn computational thinking, variables, data structures, control flow, and object-oriented principles.",
      outcome:
        "Write clean, modular code, reason about algorithms and complexity, and build standalone command-line applications.",
      prerequisites: JSON.stringify([
        "Basic computer literacy and file management",
        "Curiosity and logical reasoning",
      ]),
      final_task_title: "CLI Task Organizer & Habit Tracker",
      final_task_description:
        "Build a modular command-line tool that lets developers add, prioritize, filter, and track daily programming tasks. Persist tasks to JSON or local files, implement input validation, and write unit tests for your core business logic.",
      topic_id: "topic-programming",
      featured_order: 1,
      steps: [
        {
          order: 1,
          title: "Introduction to Computational Thinking & Variables",
          description:
            "Understand data types, operators, memory allocation, and how code executes line-by-line.",
          resource_slug: "java-programming",
          external_url: null,
          minutes: 45,
        },
        {
          order: 2,
          title: "Control Flow, Branching & Loops",
          description:
            "Master if/else conditionals, switch expressions, and loop iterations with clean control flow.",
          resource_slug: "java-programming",
          external_url: null,
          minutes: 60,
        },
        {
          order: 3,
          title: "Object-Oriented Design & Data Collections",
          description:
            "Design classes, records, and interfaces. Organize data using Lists, Sets, and Maps.",
          resource_slug: "java-programming",
          external_url: null,
          minutes: 90,
        },
        {
          order: 4,
          title: "Version Control Foundations with Git",
          description:
            "Initialize repositories, stage commits with clear messages, and create feature branches.",
          resource_slug: "git-fundamentals-to-branching",
          external_url: null,
          minutes: 45,
        },
      ],
    },
    {
      id: "path-backend-foundations",
      slug: "backend-foundations",
      title: "Backend Foundations",
      summary:
        "Transition from standalone scripts to production web services. Learn HTTP, client-server models, relational databases, and REST APIs.",
      outcome:
        "Design schema-backed relational databases, build and secure HTTP REST APIs, and handle errors gracefully.",
      prerequisites: JSON.stringify([
        "Programming Foundations or equivalent experience in Java or TypeScript",
        "Basic command-line terminal navigation",
      ]),
      final_task_title: "Study Session Tracker REST API",
      final_task_description:
        "Design and implement an authenticated REST API for developers to record study sessions, track progress across software topics, and calculate weekly coding metrics. Include relational schema migrations, input validation, and automated API tests.",
      topic_id: "topic-backend",
      featured_order: 2,
      steps: [
        {
          order: 1,
          title: "HTTP Protocol, Verbs & Client-Server Architecture",
          description:
            "Understand HTTP request/response headers, status codes, query strings, and payload serialization.",
          resource_slug: "restful-api-design-guide",
          external_url: null,
          minutes: 60,
        },
        {
          order: 2,
          title: "Relational Modeling & SQL Queries with PostgreSQL",
          description:
            "Model entities with primary/foreign keys, write multi-table JOINs, and enforce data constraints.",
          resource_slug: "practical-sql-relational-databases",
          external_url: null,
          minutes: 90,
        },
        {
          order: 3,
          title: "RESTful Service Design & Controller Endpoints",
          description:
            "Implement CRUD endpoints, validate request bodies, and structure clean service and repository layers.",
          resource_slug: "java-programming",
          external_url: null,
          minutes: 120,
        },
        {
          order: 4,
          title: "Production Error Handling, Logging & Security",
          description:
            "Enforce authentication, handle unexpected errors with RFC 7807 problem details, and write integration tests.",
          resource_slug: "restful-api-design-guide",
          external_url: null,
          minutes: 75,
        },
      ],
    },
  ];

  for (const pathItem of pathsToSeed) {
    const existing = await db.query(
      "SELECT id FROM learning_paths WHERE slug = $1",
      [pathItem.slug]
    );

    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO learning_paths (
          id, slug, title, summary, outcome, prerequisites,
          final_task_title, final_task_description, topic_id, featured_order,
          status, draft_title, draft_summary, draft_outcome, draft_prerequisites,
          draft_final_task_title, draft_final_task_description, draft_topic_id,
          draft_featured_order, has_draft_changes
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          'published', $3, $4, $5, $6,
          $7, $8, $9,
          $10, FALSE
        )`,
        [
          pathItem.id,
          pathItem.slug,
          pathItem.title,
          pathItem.summary,
          pathItem.outcome,
          pathItem.prerequisites,
          pathItem.final_task_title,
          pathItem.final_task_description,
          pathItem.topic_id,
          pathItem.featured_order,
        ]
      );

      // Insert steps
      for (const step of pathItem.steps) {
        let resId = null;
        if (step.resource_slug) {
          const r = await db.query(
            "SELECT id FROM resources WHERE slug = $1",
            [step.resource_slug]
          );
          if (r.rows.length > 0) resId = r.rows[0].id;
        }

        await db.query(
          `INSERT INTO learning_path_steps (
            id, path_id, step_order, title, description, resource_id, external_url, estimated_minutes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            `step-${pathItem.slug}-${step.order}`,
            pathItem.id,
            step.order,
            step.title,
            step.description,
            resId,
            step.external_url,
            step.minutes,
          ]
        );
      }
    }
  }

  // 7. Pages (Explore homepage and About page)
  const existingExplore = await db.query(
    "SELECT key FROM pages WHERE key = 'explore'"
  );
  if (existingExplore.rows.length === 0) {
    const exploreData = {
      heroTitle: "Build Real Software with Rean (រៀន)",
      heroSubtitle:
        "A calm, distraction-free discovery hub for Cambodian students and software engineers. Curated books, guides, guided learning paths, and hands-on practice projects.",
      featuredTopicsHeading: "Core Learning Domains",
      curatedPicksHeading: "Curated Launch Resources",
      catalogHeading: "Software Development Catalog",
      pathsHeading: "Structured Learning Paths",
    };
    await db.query(
      `INSERT INTO pages (key, title, published_content, draft_content, status, has_draft_changes)
       VALUES ('explore', 'Explore Rean', $1, $1, 'published', FALSE)`,
      [JSON.stringify(exploreData)]
    );
  }

  const existingAbout = await db.query(
    "SELECT key FROM pages WHERE key = 'about'"
  );
  if (existingAbout.rows.length === 0) {
    const aboutData = {
      pageTitle: "About Rean (រៀន)",
      mission:
        "Rean (រៀន — Khmer for 'Learn') was founded to provide accessible, structured, and practical software engineering education. Our mission is to bridge the gap between academic theory and the daily realities of production software engineering.",
      audience:
        "Rean is designed specifically for high school and university students, self-taught developers, and early-career software engineers who seek clear, disciplined learning pathways rather than fragmented tutorials.",
      learningApproach:
        "We believe in project-driven mastery. Every concept is explained with direct code examples, and every learning path culminates in a real practice project. We prioritize fundamentals over fleeting hype.",
      selectionCriteria:
        "Every book, guide, and tool included in the Rean catalog is vetted against rigorous criteria: clarity of explanation, adherence to modern industry standards, zero marketing fluff, and open accessibility.",
      ctaExploreLabel: "Explore Resource Catalog",
      ctaPathsLabel: "View Learning Paths",
    };
    await db.query(
      `INSERT INTO pages (key, title, published_content, draft_content, status, has_draft_changes)
       VALUES ('about', 'About Rean (រៀន)', $1, $1, 'published', FALSE)`,
      [JSON.stringify(aboutData)]
    );
  }

  // 8. Navigation Items
  const navCount = await db.query("SELECT COUNT(*) AS count FROM navigation_items");
  if (parseInt(navCount.rows[0].count, 10) === 0) {
    const navItems = [
      { id: "nav-1", label: "Explore", url: "/", order: 1, position: "header" },
      { id: "nav-2", label: "Learning Paths", url: "/paths", order: 2, position: "both" },
      { id: "nav-3", label: "Programming", url: "/topics/programming", order: 3, position: "header" },
      { id: "nav-4", label: "About", url: "/about", order: 4, position: "both" },
      { id: "nav-5", label: "Explore Catalog", url: "/", order: 5, position: "footer" },
      { id: "nav-6", label: "Admin Portal", url: "/admin", order: 6, position: "footer" },
    ];

    for (const item of navItems) {
      await db.query(
        `INSERT INTO navigation_items (id, label, url, display_order, position, is_published)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [item.id, item.label, item.url, item.order, item.position]
      );
    }
  }

  // 9. Site Settings
  const existingSettings = await db.query(
    "SELECT key FROM site_settings WHERE key = 'general'"
  );
  if (existingSettings.rows.length === 0) {
    await db.query(
      `INSERT INTO site_settings (
        key, site_name, site_description, logo_url, favicon_url,
        default_social_image, footer_copy, meta_titles, meta_descriptions
      ) VALUES (
        'general',
        'Rean (រៀន)',
        'Public software development learning and resource platform with guided paths and practical projects.',
        '/images/logo.png',
        '/images/brand-book.png',
        '/images/logo.png',
        '© 2026 Rean (រៀន). Dedicated to software craftsmanship and student empowerment.',
        '{"explore": "Rean (រៀន) — Software Development Learning & Resource Hub", "about": "About Rean (រៀន) — Our Mission & Approach", "paths": "Learning Paths — Structured Engineering Roadmaps"}'::jsonb,
        '{"explore": "Discover curated programming resources, tutorials, and guided paths.", "about": "Learn about Rean mission, audience, and editorial standards.", "paths": "Follow structured roadmaps from programming foundations to backend services."}'::jsonb
      )`
    );
  }

  console.log("Database seeding completed successfully!");
}
