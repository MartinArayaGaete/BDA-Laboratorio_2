FROM  eclipse-temurin:25-jdk-alpine-3.22

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw

RUN chmod -R +x mvnw

# Dependency download for offline use
RUN ./mvnw dependency:go-offline

COPY src ./src

CMD ["./mvnw", "spring-boot:run"]