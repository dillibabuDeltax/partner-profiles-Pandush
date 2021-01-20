mvnDebugMode=${mavenDebug}

function mvn_cmd()
{
    if [ "$mvnDebugMode" == "Y" ]
    then
        echo "mvn -X"
    else
        echo "mvn"
    fi
}
