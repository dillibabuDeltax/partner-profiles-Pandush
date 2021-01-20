#!/bin/bash
source $(dirname $0)/common.sh

# ************  Steps ******************
#    Update the target directory test files with proper northbound domain so that integration test can hit the right endpoint
#    Execute the integration test
# *************************************

echo "**** Started PERF test ****"

echo "Perf Testing File Name: ${testFileName}"
echo "Perf Testing output File: ${outputFileNamePrefix}" 
echo "User Threads: ${userThreads}"
echo "repeat count: ${repeatCount}"

echo "Runing performance test"
$(mvn_cmd) verify -Pperformance
rm -rf tmp
rm -rf target/jmeter
rm target/config.json
if [ $? -ne 0 ]; then
  echo "performance test failed"
  exit 1
fi
