#!/bin/bash
source $(dirname $0)/common.sh

# ************  Steps ******************
#    Update the target directory test files with proper northbound domain so that integration test can hit the right endpoint
#    Execute the integration test
# *************************************

echo "**** Started Pen test ****"

echo "Northbound domain is: ${apigeeNorthBoundDomain}"
echo "Pen Test scripts: ${penTestScript}"
echo "Environment testing in: ${penTestEnvironment}" 
echo "Output file created in: ${penTestReportOutputDir}"
echo "Output file format: ${penTestReportFormat}"

echo "*** Runing Pen test ***"

echo "working directory ..."

readyapi-test ${penTestScript} -E${penTestEnvironment} -F${penTestReportFormat} -R"SecurityTest Report" -f${penTestReportOutputDir}
if [ $? -ne 0 ]; then
  echo "pen test failed"
  exit 1
fi

echo "**** Pen test complete ****"