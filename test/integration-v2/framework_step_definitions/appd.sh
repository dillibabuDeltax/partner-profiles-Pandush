echo "in shell script for app D script"


echo "1st parameter is ${1}"
echo "2nd parameter is ${2}"
echo "3rd parameter is ${3}"


tableName=$1
AccountName=$2
apiKey=$3

repoPath=`pwd`
echo "repoPath is: ${repoPath}
appdJson=`cat ${repoPath}/reports/appd_report.json`
echo "appdJson is ${appdJson}"

#: '
curl -X POST "http://appdynamics-dev.corp.example.com:9080/events/publish/${tableName}" \
-H"X-Events-API-AccountName:${AccountName}" \
-H"X-Events-API-Key:${apiKey}" \
-H"Content-type: application/vnd.appd.events+json;v=2" \
-d "${appdJson}"
#'