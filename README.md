# API proxy for Partner Profiles API

## Commands

### Install Node dependencies via npm (only need to execute one time)
npm install

### run chai mocha (integration v2) tests (see scripts/local-int script to change env)
npm test

### Alternative Install Node dependencies via maven (only need to execute one time)
```mvn exec:exec@npm-install```

### clean, build and test against perf (dbpl) or mock
goto scripts/local-int-test-v2.sh

### WIP for jmeter tests
mvn verify -Pperformance

### Build
1. Step 1
```mvn resources:resources@copy-resources -Ddeployment.suffix=${apigeeDeploymentSuffix}```
2. Step 2
```mvn com.google.code.maven-replacer-plugin:replacer:replace@replace-tokens -Ddeployment.suffix=${apigeeDeploymentSuffix}```
3. Step 3
```mvn apigee-enterprise:configure@configure-bundle-step -Ddeployment.suffix=${apigeeDeploymentSuffix}```

### Code quality
1. Step 1
```mkdir ./target/reports```
2. Step 2
```mvn jshint:lint```
3. Step 3
```mvn exec:exec@apigee-lint```

### Deploy
1. No deployment possible via local environment.
2. Use CI to deploy

### Integration test (OUTDATED)
1. Step 1 - Update the test config with the base URL, etc.
```mvn resources:resources@copy-apickli-config && mvn com.google.code.maven-replacer-plugin:replacer:replace@replace-apigee-northbound-domain -Ddeployment.suffix=<<your-name>> -Dapi.northbound.domain=sandbox-api.example.com```
2. Step 2 - Run the test
```mvn exec:exec@integration-test -Dapi.testtag=~@wip```

**API Version:** 1.0

**Line of businesses covered:** MinuteClinic

**Backend:** DBPL, Wiremock

**Confluence documentation Link:** TBD

**Shared flows used:** response-handler-v1,  

-------------
## Run this API in postman

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/d3557c2e81847115fe41#?env%5Blocator-api-v1%5D=W3sia2V5IjoieC1hcGkta2V5IiwidmFsdWUiOiJEVU1NWSIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiaG9zdCIsInZhbHVlIjoiaHR0cHM6Ly9zYW5kYm94LWFwaS5jdnNoZWFsdGguY29tIiwiZW5hYmxlZCI6dHJ1ZX1d)

Please follow this tutorial to import this [Postman Collection](https://www.getpostman.com/docs/collections).

## Pre-requisites

- [ ] Preferebaly Mac as your development machine
- [ ] NodeJS 8 or above
- [ ] Java 8 (Oracle JDK 8.0 preferred)
- [ ] Maven
   - [ ] A strong knowledge on Maven is recommended to understand how Maven works and how flexible it is.
   - [ ] Maven installed on your machine as well.
- [ ] Visual Studio Code or any decent IDE
- [ ] Git client
- [ ] Access to apigee
  - [ ] Org—> example-non-prod
  - [ ] Env—> sandbox
- [ ] Access to [Gitlab - API Platform Group](https://gitw.example.com/api-platform/) with a *Developer* role
- [ ] NPM install Apickli and cucumber

## Sandbox environment development guide
Before going through the below steps, please read [Apigee Confluence page](https://newcoproduct.atlassian.net/wiki/spaces/apigee/pages/754681341/API+Development+journey) and make sure to understand the basic workflow on how a proxy will be developed and deployed.

- As an Engineer, you will have access to Sandbox environment *ONLY*.
- You will have flexibility to deploy the api proxy with a suffix to it so that you can have your own copy of the proxy.
    - Example: curreny-**your-name**-v1
    - This is achieved by using the Maven Environment variable **deployment.suffix**
        - Example: -Ddeployment.suffix=<<your-name>>
- Please refer the maven commands section for more details on what commands to use and for what purpose.

## Folder structure

Please follow the standard folder structure and there is a significance to each directory in the repo.

```
 |apiname-v1
    |-apiproxy/ --> Proxy bundle downloaded from apigee edge after initial development on Sandbox env.
        |-proxies
        |-resources
        |-policies
        |-targets
    |-scripts/ --> Scripts used by CICD Platform. No need to update anything.
        |-build.sh
        |-code-quality.sh
        |-deploy.sh
        |-unit-test.sh
    |-test/ --> Directory for test scripts
        |-integration-v2
           |-test-config.json
           |-features
                |-clinic-locator-api-v1.feature -> feature file where Gherkin scenarios should exist
                |-step-definitions
                    |-apickli-gherkin.js -> out of the box definitions for steps defined in feature file
                    |-init.js -> Initiation script for definitions
                    |-clinic-locator-api-v1.js -> custom definitions for some steps not covered by apickli-gherkin.js
                |-fixtures
        |-unit
        |-perf
    |-Jenkinsfile --> Drives CICD integration
    |-package.json --> Drives nodejs dependencies for tests
    |-pom.xml --> Maven configurations used for executing various tasks like build, test, deploy, etc.
```



## FAQs

Some frequently asked questions and answers below.

- What environment am I allowed to deploy my proxy?
  -  **Sandbox** and all Dev environments (dev3 is likely not setup yet)
- What are the responsibilities of an API Engineer?
    - Build proxy using OpenAPI spec
        - Build via Edge UI
        - download .zip from UI and replace apiproxy folder in this repo
          - ? Generate the proxy using Proxy generator tool (Future state) ?
    - Run code quality scan in local environment to make sure all coding standards are followed. **Note:** Deployment to higher environments is **NOT** permitted if the basic coding standards are NOT met.
    - Write Integration tests
    - Run the Integration Tests in local pointing to dev2 environment
    - Once all the test cases are written and all tests are passing, push the code to Gitlab
- How will CICD kick off?
    - Go to jenkins and click "build now"
    - The wiremock repo is enabled with a *post commit hook*, so CICD will kick off the Jenkins job automatically. This repo is not setup with that hook.