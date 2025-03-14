# PrEP Module

## Project Title & Description

**PrEP Module**

- PrEP is a comprehensive module designed to manage Pre-Exposure Prophylaxis (PrEP) services within LamisPlus EMR.
- It provides functionalities for managing patient data, PrEP eligibility, enrollment, clinic visits, interruptions, and regimens.
- The module integrates with existing LamisPlus EMR modules to streamline the management of PrEP services.

### Key Features

- Manage patient information and PrEP eligibility
- Handle PrEP enrollment and clinic commencement
- Track patient activities and interruptions
- Track patient PrEP status
- Manage PrEP regimens
- Integrate with related LamisPlus modules

## System Requirements

### Prerequisites

- IDE of choice (IntelliJ, Eclipse, etc.)
- Java 8+
- Node.js
- React.js

### Clone the Repository

```bash
git clone https://github.com/lamisplus/PrEP-Module.git
cd /<projects-folder>/PrEP-Module
```

## Run in Development Environment

### Install Dependencies

1. Install Java 8+
2. Install PostgreSQL 14+
3. Install Node.js
4. Install React.js
5. Open the project in your IDE of choice.

### Update Configuration File

1. Update Maven application properties as required.

### Run Build and Install Commands

1. Change the directory to `src`:

    ```bash
    cd src
    ```

2. Run frontend build command:

    ```bash
    npm run build
    ```

3. Run Maven clean install:

    ```bash
    mvn clean install
    ```

## Package for Production Environment

1. Run Maven package command:

    ```bash
    mvn clean package
    ```

## Launch Packaged JAR File

1. Launch the JAR file:

    ```bash
    java -jar <path-to-jar-file>
    ```

2. Optionally, run with memory allocation:

    ```bash
    java -jar -Xms4096M -Xmx6144M <path-to-jar-file>
    ```

## Visit the Application

- Visit the application on a browser at the configured port:

    ```bash
    http://localhost:8080
    ```

## Access Swagger Documentation

- Visit the application at:

    ```bash
    http://localhost:8080/swagger-ui.html#/
    ```

## Access Application Logs

- Application logs can be accessed in the `application-debug` folder.

## Configuration Steps

- Set up the PostgreSQL database and update the connection details in the `module.yml` file.
- Ensure the `application.properties` file in the core module is configured with the correct database URL, username, and password.

## Usage

### Running the Application

```bash
mvn spring-boot:run
```

### Example Commands or Screenshots

- Access the application at `http://localhost:8080`.

## API Usage

- Refer to the Swagger API documentation for endpoint details.

## Environment Variables

- `DATABASE_URL`: Refer to the core module
- `SPRING_PROFILES_ACTIVE`: Refer to the core module
- Configuration files: Refer to the core module

## Development Setup

### Local Development Environment

Clone the repository:

```bash
git clone https://github.com/lamisplus/PrEP-Module.git
cd /<projects-folder>/PrEP-Module
```

## Running the Project in Development Mode

```bash
mvn spring-boot:run
```

## Debugging Tips

- Use an IDE like IntelliJ IDEA or Eclipse for debugging.
- Set breakpoints and use the debugger to step through the code.

## Testing

### Running Tests

```bash
mvn test
```

### Testing Frameworks Used

- JUnit (Spring Boot's default test library inherited from parent POM)

## Deployment

### Steps to Deploy the Application

- Build the project using Maven:

    ```bash
    mvn clean package
    ```

- Deploy the generated JAR file to your application server.

## Supported Platforms

- Docker
- Kubernetes
- AWS
- Azure

## Contributing

### Guidelines for Contributing

- Fork the repository and create a new branch for your feature or bug fix.
- Ensure your code follows the project's code style and guidelines.
- Submit a pull request with a detailed description of your changes.

## Code Style and Formatting

- Follow the Java Code Conventions.
- Use meaningful variable and method names.

### Branching and Pull Request (PR) Policies

- Use feature branches for new features.
- Ensure all tests pass before submitting a PR.
- Provide a detailed description of changes in the PR.

## License

- MIT License

## Authors & Acknowledgments

### Main Contributors

- Gamaliel Dashua, @gamalieldashuaDataFi, @Gamey001 (main contributor)
- Special Mentions: @Asquarep, @joshuagabriel-datafi, @Ganiyatyakub, @AJ-DataFI

## Troubleshooting & FAQs

### Common Issues and Solutions

- **Database Connection Error**: Ensure that the `DATABASE_URL` in `application.properties` is correct and the database server is running.
- **Issue Report: PrEP Visit Form Submission Failure**: Sometimes after major modifications, the PrEP Visit form cannot be submitted due to structural issues requiring refactoring. Efforts are underway to address this. Meanwhile, check the validation error object and verify if the patient has eligibility matching the visit date.

### FAQs

- **Q: How do I reset my database?**
  - **A**: Run the database migration script located in the migrations directory.

- **v2.2.1**: Updated dependencies and improved API endpoints.
```
