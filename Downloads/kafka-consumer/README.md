# Kafka Consumer (Sky Ecommerce)

A Spring Boot-based Kafka consumer service for an e-commerce domain featuring:
- Auth module with signup/login and OTP verification flow
- Order domain with REST API and event publishing
- Kafka listener(s) for domain and generic events
- Outbox pattern for reliable event delivery (scheduler + repository)
- Monitoring endpoints and in-memory store for recent Kafka messages
- Centralized event envelope abstraction

## Tech Stack
- Java 17+ (recommended)
- Spring Boot
- Apache Kafka
- Maven
- Spring Data JPA (for Outbox and domain storage)
- Spring Security (Auth)

## Project Structure (high level)
- src/main/java/com/sky_ecommerce/auth/...: Auth API, domain, service, and security
- src/main/java/com/sky_ecommerce/order/...: Order API, domain, service, and events
- src/main/java/com/sky_ecommerce/outbox/...: Outbox entity, repo, scheduler, and service
- src/main/java/com/sky_ecommerce/listeners/...: Kafka listeners for e-commerce events
- src/main/java/com/sky_ecommerce/common/...: EventEnvelope and factory abstractions
- src/main/java/com/sky_ecommerce/config/...: Kafka configuration
- src/main/java/com/sky_ecommerce/monitor/...: Monitoring controller and store
- src/main/java/com/example/kafkaconsumer/...: Sample listeners and main application
- src/main/resources/application.yml: Spring and Kafka configuration

## Prerequisites
- JDK 17+
- Maven 3.9+
- Kafka broker (locally via Kafka/ZooKeeper or KRaft mode, or remote)
- A running database if configured for persistence (H2/postgres/etc. per your application.yml)
- Proper Kafka topics created (see Configuration)

## Configuration
Key config lives in:
- src/main/resources/application.yml

Typical items to verify/update:
- spring.kafka.bootstrap-servers
- group-id and client-id (if configured)
- topic names (orders, payments, etc.)
- Security properties (if any) for auth module
- DB connection (if not using embedded)

Check or create required Kafka topics before running. If you use auto-creation, ensure the broker allows it.

## Build and Run
Build:
- mvn clean package

Run:
- mvn spring-boot:run
  or run the packaged jar in target:
- java -jar target/kafka-consumer-1.0.0.jar

## REST APIs (summary)
Auth (com/sky_ecommerce/auth/api):
- POST /api/auth/signup: SignupRequest → SignupResponse (initiates OTP flow)
- POST /api/auth/verify-otp: VerifyOtpRequest → 200 on success
- POST /api/auth/login: LoginRequest → LoginResponse (token/session info)
- GET /api/auth/me (if available per SecurityConfig): returns UserDto

Order (com/sky_ecommerce/order/api):
- POST /api/orders: CreateOrderRequest → Order created; triggers OrderEvents (created/paid/cancelled patterns exist)
- GET/PUT endpoints as implemented in OrderController (inspect file for full list and payloads)

Events Publisher (com/sky_ecommerce/events/PublishController):
- POST /api/events/publish: Publish arbitrary events via EventEnvelope (useful for testing listeners)

Monitoring (com/sky_ecommerce/monitor):
- GET /api/monitor/messages: View recent messages captured by MonitoringStore
- Other endpoints provided by MonitoringController for quick inspection/health

## Kafka Consumers
- com/sky_ecommerce/listeners/EcommerceListeners: Domain-specific Kafka listeners for e-commerce events
- com/example/kafkaconsumer/EventListener and OrderListener: Example listeners for generic and order-related topics

Events are wrapped with com/sky_ecommerce/common/EventEnvelope and constructed via EventEnvelopeFactory.

## Outbox Pattern
- OutboxEntity, OutboxRepository, OutboxService: Persist pending events
- OutboxScheduler: Periodically reads pending outbox entries and publishes to Kafka, then marks them sent
- Ensures reliable, eventually consistent event publication alongside domain transactions

## Local Testing Tips
1) Start Kafka locally and create topics used by listeners and outbox publisher.
2) Run the app:
   - mvn spring-boot:run
3) Publish test event:
   - POST /api/events/publish with a JSON body containing type, key, payload, and topic.
4) Inspect monitoring:
   - GET /api/monitor/messages to confirm consumed events.

## Development Notes
- Adjust application.yml for local ports, Kafka bootstrap servers, and topic names
- Review SecurityConfig to enable/disable endpoints during development
- For database-backed outbox, ensure schema exists or enable automatic DDL

## Building the Jar
- mvn clean package
- Output at target/kafka-consumer-1.0.0.jar

## Project Origin
Git remote: https://github.com/Isaac-Arinze/healthcare-system-chatbot.git
This module is a Kafka consumer service adapted for an e-commerce domain under the sky_ecommerce packages.

## License
Add your preferred license here (MIT/Apache-2.0/etc).
