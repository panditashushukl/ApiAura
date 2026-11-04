# ApiAura CLI Commands Reference

This document outlines the command-line interface (CLI) commands and arguments supported by the ApiAura backend.

---

## 1. Database Seeding (`AdminDataInitializer`)

By default, ApiAura **does not** run seeders on standard application startup (`mvn spring-boot:run` or `java -jar`). Database seeding is opt-in via CLI flags.

### Supported Flags & Arguments

| Flag / Argument | Alias | Description |
| :--- | :--- | :--- |
| `--seed` | `seed`, `--seed-data`, `--init-data` | Triggers the seeding of default RBAC permissions (36 canonical permissions), roles (`SUPER_ADMIN`, `ADMIN`, `GUEST`), and initial Super Admin user. |
| `--exit` | `exit`, `--exit-after-seed`, `--seed-only` | Instructs the application to shut down gracefully immediately after completing seeding. |
| `--admin-email=<email>` | - | *(Optional)* Overrides default admin email for the seeded user. |
| `--admin-password=<password>` | - | *(Optional)* Overrides default admin password for the seeded user. |
| `--admin-name=<name>` | - | *(Optional)* Overrides default admin display name. |

---

### Usage Examples

#### Run Database Seeding and Keep Server Running
Runs the seeders and continues booting the web server:

```bash
# Using Maven wrapper
./mvnw spring-boot:run -Dspring-boot.run.arguments="--seed"

# Using JAR file
java -jar target/apiaura-0.0.1-SNAPSHOT.jar --seed
```

#### Run Database Seeding as a One-Shot Task (Seed & Exit)
Executes seeding within a database transaction, commits it, and terminates gracefully with exit code `0`:

```bash
# Using Maven wrapper
./mvnw spring-boot:run -Dspring-boot.run.arguments="--seed --exit"

# Using JAR file
java -jar target/apiaura-0.0.1-SNAPSHOT.jar --seed --exit

# Positional syntax
java -jar target/apiaura-0.0.1-SNAPSHOT.jar seed exit
```

#### Seed with Custom Admin Credentials via CLI
Overrides environment variables or application properties directly from CLI:

```bash
# Using Maven wrapper
./mvnw spring-boot:run -Dspring-boot.run.arguments="--seed --admin-email=admin@domain.com --admin-password=MySuperPassword! --admin-name=\"Root Admin\""

# Using JAR file
java -jar target/apiaura-0.0.1-SNAPSHOT.jar --seed --admin-email=admin@domain.com --admin-password=MySuperPassword! --admin-name="Root Admin"
```

---

## 2. Default Startup Behavior (Without `--seed`)

When running without `--seed`:

```bash
./mvnw spring-boot:run
# OR
java -jar target/apiaura-0.0.1-SNAPSHOT.jar
```

The application logs:
```
AdminDataInitializer: Seeding skipped (default behavior). Pass '--seed' or argument 'seed' via CLI to seed initial permissions, roles, and admin user.
```
and launches the HTTP server immediately without executing any database initialization scripts or queries.
