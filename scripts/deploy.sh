#!/bin/bash
source $(dirname $0)/common.sh

# ************  Steps ******************
#    Deploy the bundle
# *************************************

echo "**** Started deployment ****"

echo "Test var is: ${testvar1}"
echo "Org is: ${apigeeOrg}"
echo "Northbound domain is: ${apigeeNorthBoundDomain}"
echo "Environment is: ${apigeeDeployEnvironment}"
echo "Username is: ${apigee_user}"
echo "Apigee deploy options are: ${apigeeDeployOptions}"
echo "Apigee deployment suffix is: ${apigeeDeploymentSuffix}" 
echo "Integration test tag is: ${intTestTag}"
echo "Token URL is: ${tokenUrl}"
echo "Auth type is: ${authType}"

echo "Deploying the proxy"
$(mvn_cmd) apigee-enterprise:deploy@deploy-bundle-step -P${apigeeDeployEnvironment} -Dorg=${apigeeOrg} -Dusername=${apigee_user} -Dpassword=${apigee_password} -Doptions=${apigeeDeployOptions} -DapigeeNorthBoundDomain=${apigeeNorthBoundDomain} -Ddeployment.suffix=${apigeeDeploymentSuffix} -DtokenUrl=${tokenUrl} -DauthType=${authType}
if [ $? -ne 0 ]; then
  echo "Unable to deploy the proxy"
  exit 1
fi

echo "**** Deployment complete ****"
