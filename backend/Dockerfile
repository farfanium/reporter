# Backend Dockerfile
FROM gradle:8-jdk17 AS build

WORKDIR /app

# Copy Gradle files
COPY build.gradle settings.gradle* ./
COPY gradle gradle

# Copy source code
COPY src src

# Build the application
RUN gradle build -x test --no-daemon

# Runtime image
FROM openjdk:17-jdk-slim

WORKDIR /app

# Create user and directories
RUN useradd -m -s /bin/bash reporter && \
    mkdir -p /app/logs /app/config && \
    chown -R reporter:reporter /app

# Copy the built jar
COPY --from=build /app/build/libs/*.jar app.jar

# Change to non-root user
USER reporter

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV SPRING_PROFILES_ACTIVE=prod

CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
