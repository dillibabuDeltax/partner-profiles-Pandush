#!/bin/bash
source $(dirname $0)/common.sh

# ************  Steps ******************
#    Update the target directory test files with proper northbound domain so that integration test can hit the right endpoint
#    Execute the integration test
# *************************************

echo "**** Started int test ****"

echo "Northbound domain is: ${apigeeNorthBoundDomain}"
echo "Apigee deployment suffix is: ${apigeeDeploymentSuffix}" 
echo "Integration test tag is: ${intTestTag}"

echo "Running v2 framework integration test"

if [ ${intTestTag} = "@mock" -o ${intTestTag} = "@both" ]; then
echo "Running v2 mock framework integration test"
./node_modules/.bin/cucumber-js --world-parameters '{"stack":"apis","datapath":"data","dataenv":"","protocol":"https","host":"'"${apigeeNorthBoundDomain}"'","report_name":"partner-profiles-Pandush","mockFlag":true}' ./test/integration-v2/both-features/* ./test/integration-v2/solo-features/mock-only.feature ./test/integration-v2/framework_step_definitions/report.feature -f json:reports/cucumber_report.json
fi

if [ $? -ne 0 ]; then
  echo "MOCK v2 framework Integration test failed"
  exit 1
fi

if [ ${intTestTag} = "@dbpl" -o ${intTestTag} = "@both" ]; then
echo "Running v2 DBPL framework integration test"
./node_modules/.bin/cucumber-js --world-parameters '{"stack":"apis","datapath":"data","dataenv":"","protocol":"https","host":"'"${apigeeNorthBoundDomain}"'","report_name":"partner-profiles-Pandush","mockFlag":false}' ./test/integration-v2/both-features/* ./test/integration-v2/solo-features/dbpl-only.feature ./test/integration-v2/framework_step_definitions/report.feature -f json:reports/cucumber_report.json
fi

if [ $? -ne 0 ]; then
  echo "DBPL v2 framework Integration test failed"
  exit 1
fi

echo "****  int test complete ****"