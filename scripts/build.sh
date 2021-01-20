#!/bin/bash
source $(dirname $0)/common.sh

# ************  Steps ******************

#    Clean the target directory
#    Install all node dependencies
#    Copy all required files to target directory
#    Replace the dynamic values/tokens with token replacer plugin
#    Package the contents using apigee edge plugin
#    Create a directory for reports (Code quality and test phase will write reports in this directory)

# *************************************

echo "**** Started build ****"

echo "Cleaning the target directory"
$(mvn_cmd) clean
if [ $? -ne 0 ]; then
  echo "Unable to clean the target directory"
  exit 1
fi

echo "Installing node dependencies"
$(mvn_cmd) exec:exec@npm-install -Ddeployment.suffix=${apigeeDeploymentSuffix}
if [ $? -ne 0 ]; then
  echo "Unable to install node dependencies"
  exit 1
fi

echo "Copying files to target directory"
$(mvn_cmd) resources:resources@copy-resources -Ddeployment.suffix=${apigeeDeploymentSuffix} 
if [ $? -ne 0 ]; then
  echo "Unable to copy files to target directory"
  exit 1
fi

echo "Packaging artifacts.. Zipping up the Proxy bundle"
$(mvn_cmd) apigee-enterprise:configure@configure-bundle-step -Ddeployment.suffix=${apigeeDeploymentSuffix}
if [ $? -ne 0 ]; then
  echo "Unable to package artifacts"
  exit 1
fi

echo "Creating reports directory under target"
mkdir ./target/reports
if [ $? -ne 0 ]; then
  echo "Unable to create report directory"
  exit 1
fi

echo "**** Build complete ****"