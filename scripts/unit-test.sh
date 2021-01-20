#!/bin/bash
source $(dirname $0)/common.sh

# ************  Steps ******************

#    Run Unit test maven goal

# *************************************

echo "**** Started Unit Testing ****"

$(mvn_cmd) exec:exec@unit
if [ $? -ne 0 ]; then
  echo "Unit test is unsuccessful"
  exit 1
fi

echo "**** Completed Unit Testing ****"
