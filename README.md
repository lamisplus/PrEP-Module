# PrEP Module

## Project Title & Description

**PrEP Module**

PrEP is a comprehensive module designed to manage Pre-Exposure Prophylaxis (PrEP) services within LamisPlus EMR. It provides functionalities for managing patient data, PrEP eligibility, enrollment, clinic visits, interruptions, and regimens. The module is designed to integrate with existing healthcare systems to streamline the management of PrEP services.

### Key Features

- Manage patient information and PrEP eligibility
- Handles PrEP enrollment and clinic commencement
- Track patient activities and interruptions
- Track patient PrEP Status
- Manage PrEP regimens
- Integration with related Lamisplus Modules

## Badges (Optional)

• CI/CD status badges (GitHub Actions, Travis CI, etc.).
• Coverage reports (CodeCov, Coveralls).
• License badge.
• Version badge.

## Table of Contents (Optional)

• Useful for long README.md files to help with navigation.

## Installation

### Prerequisites

- Java Development Kit (JDK) 1.8
- IntelliJ Idea IDE (Recommended) or any Java IDE
- node 16 for client side

## Install Dependencies

### Clone the repository:

git clone https://github.com/lamisplus/PrEP-Module.git
cd /<projects-folder>/PrEP-Module

## Install Maven dependencies:

• mvn clean install

## Configuration Steps

• Set up the PostgreSQL database and update the connection details in the module.yml file.
• Ensure the application.properties file in the core module is configured with the correct database URL, username, and password.

## Usage

### Running the Application

• mvn spring-boot:run

### Example Commands or Screenshots

• Access the application at http://localhost:8080.

## API Usage

• Refer to the API documentation for endpoint details.

## Configuration (Optional)

## Environment Variables

• DATABASE_URL: Refer to the core module
• SPRING_PROFILES_ACTIVE:
• Configuration Files: Refer to the core module
• application.properties: Refer to the core module

## Development Setup

###Local Development Environment
Clone the repository:
• git clone [<repository-url>](https://github.com/lamisplus/PrEP-Module.git)
• cd /<projects-folder>/PrEP-Module

## Running the Project in Development Mode

mvn spring-boot:run

## Debugging Tips

• Use an IDE like IntelliJ IDEA or Eclipse for debugging.
• Set breakpoints and use the debugger to step through the code.

## Testing

### Running Tests

mvn test

## Testing Frameworks Used

• JUnit (Springboot's Default test library Inherited from parent POM)

## Deployment

### Steps to Deploy the Application

• Build the project using Maven: mvn clean package
• Deploy the generated JAR file to your application server.

## Supported Platforms

• Docker
• Kubernetes
• AWS
• Azure e.t.c

## API Documentation

### Prep Clinic Endpoints

• PUT /api/v1/prep-clinic/{id}: Update Prep Clinic by ID.
• GET /api/v1/prep-clinic/{id}: Get Prep Clinic by ID.
• GET /api/v1/prep-clinic/person/{personId}: Get Prep Clinic by Person ID.
• DELETE /api/v1/prep-clinic/{id}: Delete Prep Clinic.
• GET /api/v1/prep-clinic/checkEnableCab/{id}/{currentVisitDate}: Check Cab-La eligibility for current visit.
• GET /api/v1/prep-clinic/hts-record/{id}: Get HTS result and date for previous visit.
• GET /api/v1/prep-clinic/current-date: Get database current date.
• PUT /api/v1/prep-clinic/updatePreviousPrepStatus: Update previous Prep status.

### Prep Regimen Endpoints

• GET /api/v1/prep-regimen: Get all Prep Regimens.
• GET /api/v1/prep-regimen/prepType: Get all Prep Regimens by Prep Type.

### Prep Eligibility Endpoints

• PUT /api/v1/prep-eligibility/{id}: Update Prep Eligibility by ID.
• GET /api/v1/prep-eligibility/{id}: Get Prep Eligibility by ID.
• GET /api/v1/prep-eligibility/person/{personId}: Get Prep Eligibility by Person ID.
• DELETE /api/v1/prep-eligibility/{id}: Delete Prep Eligibility.

### Prep Interruption Endpoints

• PUT /api/v1/prep-interruption/{id}: Update Prep Interruption by ID.
• GET /api/v1/prep-interruption/{id}: Get Prep Interruption by ID.
• GET /api/v1/prep-interruption/person/{personId}: Get Prep Interruption by Person ID.
• DELETE /api/v1/prep-interruption/{id}: Delete Prep Interruption.

### Prep Enrollment Endpoints

• PUT /api/v1/prep-enrollment/{id}: Update Prep Enrollment by ID.
• GET /api/v1/prep-enrollment/{id}: Get Prep Enrollment by ID.
• GET /api/v1/prep-enrollment/person/{personId}: Get Prep Enrollment by Person ID.
• DELETE /api/v1/prep-enrollment/{id}: Delete Prep Enrollment.

### Authentication & Authorization

• Ensure that the user is authenticated before accessing the endpoints.
• Authorization is required for specific endpoints.

### Example API Requests

GET /api/v1/prep/persons/9650
POST /api/v1/prep/eligibility
{
"counselingType": "143",
"drugUseHistory": {
"useAnyOfTheseDrugs": "",
"inject": "",
"sniff": "",
"smoke": "",
"Snort": "",
"useDrugSexualPerformance": "",
"hivTestedBefore": "",
"recommendHivRetest": "",
"clinicalSetting": "",
"reportHivRisk": "",
"hivExposure": "",
"hivTestResultAtvisit": "Negative",
"lastTest": ""
},
"extra": {},
"firstTimeVisit": true,
"hivRisk": {},
"numChildrenLessThanFive": "",
"numWives": "",
"personId": 14629,
"personalHivRiskAssessment": {
"unprotectedVaginalSexCasual": "",
"unprotectedVaginalSexRegular": "",
"uprotectedAnalSexWithCasual": "",
"uprotectedAnalSexWithRegular": "",
"stiHistory": "",
"sharedNeedles": "",
"moreThan1SexPartner": "",
"analSexWithPartner": "",
"unprotectedAnalSexWithPartner": "",
"haveYouPaidForSex": "",
"haveSexWithoutCondom": "",
"experienceCondomBreakage": "",
"takenPartInSexualOrgy": ""
},
"sexPartner": "Male",
"sexPartnerRisk": {
"haveSexWithHIVPositive": "",
"haveSexWithPartnerInjectDrug": "",
"haveSexWithPartnerWhoHasSexWithMen": "",
"haveSexWithPartnerTransgender": "",
"sexWithPartnersWithoutCondoms": ""
},
"stiScreening": {
"vaginalDischarge": "",
"lowerAbdominalPains": "",
"urethralDischarge": "",
"complaintsOfScrotal": "",
"complaintsGenitalSore": "",
"analDischarge": "",
"analItching": "",
"analpain": "",
"swollenIguinal": "",
"genitalScore": ""
},
"targetGroup": "TARGET_GROUP_GEN_POP",
"uniqueId": "57856674",
"visitDate": "2025-03-10",
"visitType": "PREP_VISIT_TYPE_INITIATION",
"reasonForSwitch": "",
"populationType": "POPULATION_TYPE_INJECTING_DRUG_USERS",
"pregnancyStatus": "PREGANACY_STATUS_POST_PARTUM",
"lftConducted": "false",
"liverFunctionTestResults": [],
"dateLiverFunctionTestResults": "",
"score": 0,
"assessmentForAcuteHivInfection": {
"acuteHivSymptomsLasttwoWeeks": "",
"unprotectedAnalOrVaginalOrSharedNeedlesLast28Days": ""
},
"assessmentForPepIndication": {
"unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours": "",
"sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours": ""
},
"assessmentForPrepEligibility": {
"hivNegative": "",
"hivRiskScore": "",
"noIndicationForPep": "",
"hasNoProteinuria": "",
"noHistoryOrSignsOfLiverAbnormalitiesCabLa": "",
"noHistoryOfDrugToDrugInteractionCabLa": "",
"noHistoryOfDrugHypersensitivityCabLa": ""
},
"servicesReceivedByClient": {
"willingToCommencePrep": "true",
"reasonsForDecline": [],
"otherReasonsForDecline": ""
}
}

## Contributing

### Guidelines for Contributing

• Fork the repository and create a new branch for your feature or bug fix.
• Ensure your code follows the project's code style and guidelines.
• Submit a pull request with a detailed description of your changes.

## Code Style and Formatting

• Follow the Java Code Conventions.
• Use meaningful variable and method names.
• Branching and Pull Request (PR) Policies
• Use feature branches for new features.
• Ensure all tests pass before submitting a PR.
• Provide a detailed description of changes in the PR.

## License

• License Type
• MIT License
• Link to License File
• LICENSE

## Authors & Acknowledgments

### Main Contributors

• Gamaliel Dashua, @gamalieldashuaDataFi, @Gamey001 (main contributor)
• Special Mentions: @Asquarep , @joshuagabriel-datafi @Ganiyatyakub @AJ-DataFI
• Troubleshooting & FAQs:

## Common Issues and Solutions

• Database Connection Error: Ensure that the DATABASE_URL in application.properties is correct and the database server is running.
• Issue Report: Prep Visit Form Submission Failure: Atimes after major modifications, the Prep Visit form cannot be submitted due to structural issues requiring refactoring. Efforts are underway to address this. Meanwhile, ensure to check the validation error object and verify if the patient has eligibility matching the visit date.
FAQs:
• Q: How do I reset my database?
• A: Run the database migration script located in the migrations directory.

## Changelog (Optional)

• v2.2.1: Updated dependencies and improved API endpoints.
