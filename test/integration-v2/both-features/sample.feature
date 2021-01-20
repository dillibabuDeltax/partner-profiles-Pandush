# WIP, please move from DBPL-only when ready in mock server
Feature: PSM dynamicinfo Node service validation

  Scenario Outline: staticInfo node call with POST method
  #Below sections calls Partnerlogin to generate tokenId
    Given I make POST service call for "staticInfo" with below request details "<Post_data>"
    When response is an "object" and status code is 405
    Then I verify "staticInfo" service response to have expected values
 
Examples:
  | Post_data| 
  #| file==sample.json;test==Sample|
