import fs from "fs";
import path from "path";
import JSZip from "jszip";

export async function ensurePhysicalSeedAssets(): Promise<{
  pdfPath: string;
  zipPath: string;
  pdfSize: number;
  zipSize: number;
}> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const pdfPath = path.join(uploadsDir, "practical-java-handbook.pdf");
  const zipPath = path.join(uploadsDir, "study-session-tracker.zip");

  // Create valid PDF if it does not exist
  if (!fs.existsSync(pdfPath)) {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 235 >>
stream
BT
/F1 22 Tf
72 710 Td
(Rean \\( \\u179a\\u17c0\\u1793 \\) - Practical Java Handbook) Tj
/F1 12 Tf
0 -36 Td
(Modern Java for Developers: Foundations, Collections, Streams, and REST) Tj
0 -24 Td
(Verified download asset for Rean learning catalog.) Tj
0 -24 Td
(https://rean.dev) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000238 00000 n 
0000000527 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
607
%%EOF`;
    fs.writeFileSync(pdfPath, Buffer.from(pdfContent, "utf-8"));
  }

  // Create valid ZIP archive if it does not exist
  if (!fs.existsSync(zipPath)) {
    const zip = new JSZip();

    zip.file(
      "README.md",
      `# Study Session Tracker (Java & Spring Boot)

A clean reference project for tracking daily learning sessions, software topics, and study milestones.

## Features
- RESTful endpoints for session logging and progress analytics
- In-memory / PostgreSQL database persistence
- Input validation and global error handling
- Integration tests with JUnit 5 and MockMvc

## Prerequisites
- Java 21+
- Maven 3.9+

## Running the Project
\`\`\`bash
./mvnw spring-boot:run
\`\`\`
`
    );

    zip.file(
      "pom.xml",
      `<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>dev.rean</groupId>
  <artifactId>study-session-tracker</artifactId>
  <version>1.0.0</version>
  <name>study-session-tracker</name>
  <description>Study Session Tracker Reference API for Rean Platform</description>
  <properties>
    <java.version>21</java.version>
  </properties>
</project>
`
    );

    const javaSrc = zip.folder("src/main/java/dev/rean/tracker");
    javaSrc?.file(
      "Application.java",
      `package dev.rean.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`
    );

    javaSrc?.file(
      "SessionController.java",
      `package dev.rean.tracker;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.Instant;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    @GetMapping
    public List<StudySession> getAllSessions() {
        return List.of(
            new StudySession("1", "Modern Java Virtual Threads", "programming", 90, Instant.now()),
            new StudySession("2", "REST API Error Handling", "backend", 60, Instant.now())
        );
    }

    public record StudySession(String id, String topic, String category, int minutesSpent, Instant recordedAt) {}
}
`
    );

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(zipPath, zipBuffer);
  }

  const pdfStats = fs.statSync(pdfPath);
  const zipStats = fs.statSync(zipPath);

  return {
    pdfPath,
    zipPath,
    pdfSize: pdfStats.size,
    zipSize: zipStats.size,
  };
}
