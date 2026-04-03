# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copia o manifesto primeiro para aproveitar o cache das dependencias.
COPY pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

# Copia apenas o codigo necessario para empacotar a API.
COPY src ./src
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine AS production

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
