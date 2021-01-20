#!/bin/bash
source $(dirname $0)/common.sh

# ************  Steps ******************

#    Run JsLint
#    Run apigeelint

# *************************************

echo "**** Started code quality step ****"

echo "Running jshint"
$(mvn_cmd) jshint:lint
if [ $? -ne 0 ]; then
  echo "JSLint is unsuccessful. Check your code quality"
  exit 1
fi

echo "Running apigeelint"
$(mvn_cmd) exec:exec@apigee-lint
if [ $? -ne 0 ]; then
  echo "Policies doesn't meet the standards from apigee."
  exit 1
fi

echo "**** Code quality step completed ****"
