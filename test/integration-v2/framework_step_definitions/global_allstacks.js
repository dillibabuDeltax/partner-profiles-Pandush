//Require the dev-dependencies
const {
    Given,
    When,
    Then} = require("cucumber");
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
const jp = require('jsonpath');
// John disabling until needed.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
chai.use(chaiHttp);
const DAO = require('./Util.js');

const getBearer = require('./header_steps.js').getBearer;
const getAuthorizationResponse = require('./header_steps.js').getAuthorizationResponse;
const getAuthenticationResponse = require('./header_steps.js').getAuthenticationResponse;
const getAccessTokenResponse = require('./header_steps.js').getAccessTokenResponse;

// this method makes GET service call - all the data is externalized from json file
Given('I make GET service call for {string} with below request details {string}', {timeout: 60 * 1000}, function(servicename, input_request_data, done) {

    var request_map = DAO.createJSON_fromString(input_request_data);
    console.log("request mapping json is" + JSON.stringify(request_map));

    var request_data = DAO.getTestdata(this.parameters,request_map);
    console.log('request body actual data is'+JSON.stringify(request_data));

    //Included getRequestURI to update the parameter value passed in uri value in runtime- updated by Arun. line 28 - 30
    //var uri = request_data['uri_value'];
    var uri =  DAO.getRequestURI(this.parameters,request_data);
    //console.log("request_uri --->  "+ uri);

    //var request_body_data = DAO.getRequestBody(this.parameters,request_data);
    var request_body_data;  //just creating blank will undefined value as setReportName looks for this variable to be passed.
    var headers = DAO.getRequestHeaders(this.parameters,request_data);

    console.log('header value is'+ JSON.stringify(headers));

    var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
    if (headers && headers != "") {
        //console.log("if loop");
        chai.request(request_url)
            .get(uri)
            .set(headers)
            .redirects(0)
            .end(function(err, res) {
                
                if (err) {
                    console.log("GET service call err" + err)
                    return done(err);
                }
                DAO.setGlobalresponse(res.status,res.body,res.header);
                //console.log('bodyvalue is'+ JSON.stringify(res));
                done();
            });
    } else {
        //console.log("else loop");
        chai.request(request_url)
            .get(uri)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(err, res) {
                if (err) {
                    console.log("GET service call err" + err)
                    return done(err);
                }
                DAO.setGlobalresponse(res.status,res.body,res.header);
                done();
            });
    }

    var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
    this.parameters[xpath_verify] = request_data['response_verify'];
    //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));

    var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,uri,request_body_data,headers);
    this.parameters[service_html_temp[0]] = service_html_temp[1];
    //console.log('executionreport_ parameters is'+ JSON.stringify(this.parameters));

    //preparing report list
    var temp_execution_report_list =[];
    if(this.parameters['execution_report_list']) {
        temp_execution_report_list = this.parameters['execution_report_list']
    }
    temp_execution_report_list.push(service_html_temp[0])
    this.parameters['execution_report_list'] = temp_execution_report_list


});


    // this method makes duplaicate GET service call - only for authorize
    Given('I make duplicate GET service call for {string} with below request details {string}', {timeout: 60 * 1000}, function(servicename, input_request_data, done) {

    var request_map = DAO.createJSON_fromString(input_request_data);
    console.log("request mapping json is" + JSON.stringify(request_map));

    var request_data = DAO.getTestdata(this.parameters,request_map);
    console.log('request body actual data is'+JSON.stringify(request_data));

    var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
    var request_uri = request_data['uri_value'];
    var request_body_data;
    var headers = DAO.getRequestHeaders(this.parameters,request_data);
    getAuthorizationResponse(request_url).then(function(response){
        
        request_uri = request_uri.replace("<<nonce>>", response.nonce) ;
        request_uri = request_uri.replace("<<state>>", response.state) ;
        
        console.log("request_uri" + request_uri);

        console.log('header value is'+ JSON.stringify(headers));
        chai.request(request_url)
            .get(request_uri)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(err, res) {
                if (err) {
                    console.log("GET service call err" + err)
                    return done(err);
                }
                DAO.setGlobalresponse(res.status,res.body,res.header);
                done();
            });
        }).catch(function(err){
            return done(err);
        });
        var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
        this.parameters[xpath_verify] = request_data['response_verify'];
        //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));

        var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,request_uri,request_body_data,headers);
        this.parameters[service_html_temp[0]] = service_html_temp[1];
        //console.log('executionreport_ parameters is'+ JSON.stringify(this.parameters));

        //preparing report list
        var temp_execution_report_list =[];
        if(this.parameters['execution_report_list']) {
            temp_execution_report_list = this.parameters['execution_report_list']
        }
        temp_execution_report_list.push(service_html_temp[0])
        this.parameters['execution_report_list'] = temp_execution_report_list
    });


    // this method makes post service call - all the data is externalized from json file
    Given('I make POST service call for {string} with below request details {string}', {timeout: 60 * 1000}, function(servicename, input_request_data, done) {
        
    var request_data = DAO.getTestdata(this.parameters,request_map);
    //console.log('request body actual data is'+JSON.stringify(request_data));

    var uri =  request_data['uri_value'];
    //console.log('uri value is'+ (uri));
    var request_body_data = DAO.getRequestBody(this.parameters,request_data);

    var headers = DAO.getRequestHeaders(this.parameters,request_data);
    //console.log('header value is'+ JSON.stringify(headers));
    var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
    //console.log('request_url value is'+ JSON.stringify(request_url));

    if (servicename==="skipBearer"){
        makeChaiRequest();
    }

    if(servicename!="skipBearer"){
        // JOHN for OAUTH2
        getBearer(request_url, headers.b64).then(function(id_token){
            headers.Authorization = "Bearer " + id_token;
            makeChaiRequest();
        })
        .catch(function(err){
            return done(err);
        });
    }
    function makeChaiRequest(){
        chai.request(request_url)
        .post(uri)
        .set(headers)
        .send(request_body_data[0])
        .end(function(err, res) {
            if (err) {
                console.log("POST service call err" + err)
                return done(err);
            }
            DAO.setGlobalresponse(res.status,res.body,res.header);
            done();
        });
    }

    var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
    this.parameters[xpath_verify] = request_data['response_verify'];
    //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));

    var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,uri,request_body_data[0],headers);
    this.parameters[service_html_temp[0]] = service_html_temp[1];

    //assigning dynamic vars to this.parameters so that we can globally use it
    if(request_body_data[1]) {
        for(var i=0 ; i<request_body_data[1].length ; i ++) {
            this.parameters[request_body_data[1][i].name] = request_body_data[1][i].value ;
        }
    }
    else {
        //console.log('dynamic array not passed')
    }

    //preparing report list
    var temp_execution_report_list =[];
    if(this.parameters['execution_report_list']) {
    temp_execution_report_list = this.parameters['execution_report_list']
    }
    temp_execution_report_list.push(service_html_temp[0])
    this.parameters['execution_report_list'] = temp_execution_report_list

});


    // this method makes post service call to authenticate after authorize
    Given('I make POST service call for {string} and with a valid session Id and below request details {string}', {timeout: 60 * 1000}, function(servicename, input_request_data, done) {
        var request_map = DAO.createJSON_fromString(input_request_data);
        var request_data = DAO.getTestdata(this.parameters,request_map);
        //console.log('request body actual data is'+JSON.stringify(request_data));
    
        var uri =  request_data['uri_value'];
        //console.log('uri value is'+ (uri));
        var request_body_data = DAO.getRequestBody(this.parameters,request_data);
        console.log('request_body_data: '+ JSON.stringify(request_body_data[0]));
    
        var headers = DAO.getRequestHeaders(this.parameters,request_data);
        //console.log('header value is'+ JSON.stringify(headers));
        var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
        //console.log('request_url value is'+ JSON.stringify(request_url));
    
        getAuthorizationResponse(request_url).then(function(res){
            request_body_data = request_body_data[0].replace("<<sessionid>>", res.sessionid) ;
            makeChaiRequest();
        })
        .catch(function(err){
            return done(err);
        });

        function makeChaiRequest(){
            chai.request(request_url)
            .post(uri)
            .set(headers)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(request_body_data)
            .end(function(err, res) {
                if (err) {
                    console.log("POST service call err" + err)
                    return done(err);
                }
                DAO.setGlobalresponse(res.status,res.body,res.header);
                done();
                console.log("res.body " + JSON.stringify(res.body));
                console.log("res.status " + res.status);
                console.log("res.header " + JSON.stringify(res.header));
            });
        }
    
        var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
        this.parameters[xpath_verify] = request_data['response_verify'];
        //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));
    
        var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,uri,request_body_data[0],headers);
        this.parameters[service_html_temp[0]] = service_html_temp[1];
    
        //assigning dynamic vars to this.parameters so that we can globally use it
        if(request_body_data[1]) {
            for(var i=0 ; i<request_body_data[1].length ; i ++) {
                this.parameters[request_body_data[1][i].name] = request_body_data[1][i].value ;
            }
        }
        else {
            //console.log('dynamic array not passed')
        }
    
        //preparing report list
        var temp_execution_report_list =[];
        if(this.parameters['execution_report_list']) {
        temp_execution_report_list = this.parameters['execution_report_list']
        }
        temp_execution_report_list.push(service_html_temp[0])
        this.parameters['execution_report_list'] = temp_execution_report_list
    
    });

    //This method calls the token exchange service after calling authorize - authenticate  
    Given('I make POST service call for {string} and with an auth code with below request details {string}', {timeout: 60 * 1000}, function(servicename, input_request_data, done) {
        var request_map = DAO.createJSON_fromString(input_request_data);
        var request_data = DAO.getTestdata(this.parameters,request_map);
        //console.log('---- Inside user info test ----');
        //console.log('request body actual data is'+JSON.stringify(request_data));
    
        var uri =  request_data['uri_value'];
        var request_body_data = DAO.getRequestBody(this.parameters,request_data);
        //console.log('request_body_data: '+ JSON.stringify(request_body_data[0]));
    
        var headers = DAO.getRequestHeaders(this.parameters,request_data);
        //console.log('header value is'+ JSON.stringify(headers));
        var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
        //console.log('request_url value is'+ JSON.stringify(request_url));
        
        getAuthorizationResponse(request_url).then(function(res){
            getAuthenticationResponse(request_url,res.sessionid).then(function(res){
                makeChaiRequest(res.authcode);
            })
            .catch(function(err){
                return done(err);
            });
        })
        .catch(function(err){
            return done(err);
        });

        function makeChaiRequest(access_token){
            var request_body = request_body_data[0].replace("<<code>>", access_token)
            chai.request(request_url)
            .post(uri)
            .set(headers)
            .send(request_body)
            .end(function(err, res) {
                if (err) {
                    console.log("POST service call err" + err)
                    return done(err);
                }
                DAO.setGlobalresponse(res.status,res.body,res.header);
                //console.log("res.body " + JSON.stringify(res.body));
                //console.log("res.status " + res.status);
                //console.log("res.header " + JSON.stringify(res.header));
                done();
                
            });
        }
    
        var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
        this.parameters[xpath_verify] = request_data['response_verify'];
        //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));
    
        var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,uri,request_body_data[0],headers);
        this.parameters[service_html_temp[0]] = service_html_temp[1];
    
        //assigning dynamic vars to this.parameters so that we can globally use it
        if(request_body_data[1]) {
            for(var i=0 ; i<request_body_data[1].length ; i ++) {
                this.parameters[request_body_data[1][i].name] = request_body_data[1][i].value ;
            }
        }
        else {
            //console.log('dynamic array not passed')
        }
    
        //preparing report list
        var temp_execution_report_list =[];
        if(this.parameters['execution_report_list']) {
        temp_execution_report_list = this.parameters['execution_report_list']
        }
        temp_execution_report_list.push(service_html_temp[0])
        this.parameters['execution_report_list'] = temp_execution_report_list
    
    });


    //This method calls the userinfo service after calling authorize - authenticate - token 
    Given('I make GET service call for {string} and with an access token with below request details {string}', {timeout: 60 * 1000}, function(servicename, input_request_data, done) {
        var request_map = DAO.createJSON_fromString(input_request_data);
        var request_data = DAO.getTestdata(this.parameters,request_map);
        //console.log('---- Inside user info test ----');
        //console.log('request body actual data is'+JSON.stringify(request_data));
    
        var uri =  request_data['uri_value'];
        var request_body_data = DAO.getRequestBody(this.parameters,request_data);
        //console.log('request_body_data: '+ JSON.stringify(request_body_data[0]));
    
        var headers = DAO.getRequestHeaders(this.parameters,request_data);
        //console.log('header value is'+ JSON.stringify(headers));
        var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
        //console.log('request_url value is'+ JSON.stringify(request_url));
        var scope = null;
        if(request_body_data[0]){
            var authentication_request = JSON.parse(request_body_data[0]);
            scope = authentication_request['scope'];
            console.log('Scope from request:'+scope);
            console.log('Authentication Request:'+JSON.stringify(authentication_request));
        }
        getAuthorizationResponse(request_url, scope).then(function(res){
            console.log("Session Id:"+res.sessionid);
            getAuthenticationResponse(request_url,res.sessionid).then(function(res){
                console.log('AuthCode:'+res['authcode']);        
                getAccessTokenResponse(request_url, res['authcode']).then(function(res){
                    console.log('AccessToken:'+res['access_token']); 
                    access_token = res['access_token'];
                    makeChaiRequest(access_token);
                }).catch(function(err){
                    console.log("error in calling user-info");
                    return done(err);
                });
            })
            .catch(function(err){
                return done(err);
            });
        })
        .catch(function(err){
            return done(err);
        });

        function makeChaiRequest(access_token){
            //console.log('Calling user info -----');
            chai.request(request_url)
            .get(uri)
            .set(headers)
            .set({"Content-Type": "application/x-www-form-urlencoded","Authorization":"Bearer " + access_token})
            .end(function(err, res) {
                if (err) {
                    console.log("POST service call err" + err)
                    return done(err);
                }
                DAO.setGlobalresponse(res.status,res.body,res.header);
                //console.log("res.body " + JSON.stringify(res.body));
                //console.log("res.status " + res.status);
                //console.log("res.header " + JSON.stringify(res.header));
                done();
                
            });
        }
    
        var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
        this.parameters[xpath_verify] = request_data['response_verify'];
        //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));
    
        var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,uri,request_body_data[0],headers);
        this.parameters[service_html_temp[0]] = service_html_temp[1];
    
        //assigning dynamic vars to this.parameters so that we can globally use it
        if(request_body_data[1]) {
            for(var i=0 ; i<request_body_data[1].length ; i ++) {
                this.parameters[request_body_data[1][i].name] = request_body_data[1][i].value ;
            }
        }
        else {
            //console.log('dynamic array not passed')
        }
    
        //preparing report list
        var temp_execution_report_list =[];
        if(this.parameters['execution_report_list']) {
        temp_execution_report_list = this.parameters['execution_report_list']
        }
        temp_execution_report_list.push(service_html_temp[0])
        this.parameters['execution_report_list'] = temp_execution_report_list
    
    });

    //This method calls the revoke service after calling authorize - authenticate - token 
    Given('I make POST service call for {string} an access token with below request details {string}', {timeout: 60 * 1000}, function(servicename, input_request_data, done) {
        var request_map = DAO.createJSON_fromString(input_request_data);
        var request_data = DAO.getTestdata(this.parameters,request_map);
        //console.log('---- Inside user info test ----');
        //console.log('request body actual data is'+JSON.stringify(request_data));
    
        var uri =  request_data['uri_value'];
        var request_body_data = DAO.getRequestBody(this.parameters,request_data);
        console.log('request_body_data: '+ JSON.stringify(request_body_data[0]));
    
        var headers = DAO.getRequestHeaders(this.parameters,request_data);
        //console.log('header value is'+ JSON.stringify(headers));
        var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
        //console.log('request_url value is'+ JSON.stringify(request_url));
        var scope = null;

        getAuthorizationResponse(request_url, scope).then(function(res){
            console.log("Session Id:"+res.sessionid);
            getAuthenticationResponse(request_url,res.sessionid).then(function(res){
                console.log('AuthCode:'+res['authcode']);        
                getAccessTokenResponse(request_url, res['authcode']).then(function(res){
                    makeChaiRequest(res);
                }).catch(function(err){
                    console.log("error in calling user-info");
                    return done(err);
                });
            })
            .catch(function(err){
                return done(err);
            });
        })
        .catch(function(err){
            return done(err);
        });

        function makeChaiRequest(res){
            var request_body = request_body_data[0].replace('<<refresh_token>>', res.refresh_token) ;
            request_body = request_body.replace('<<access_token>>', res.access_token) ;
            //console.log('Calling user info -----');
            chai.request(request_url)
            .post(uri)
            .set(headers)
            .send(request_body)
            .end(function(err, res) {
                if (err) {
                    console.log("POST service call err" + err)
                    return done(err);
                }
                DAO.setGlobalresponse(res.status,res.body,res.header);
                //console.log("res.body " + JSON.stringify(res.body));
                //console.log("res.status " + res.status);
                //console.log("res.header " + JSON.stringify(res.header));
                done();
                
            });
        }
    
        var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
        this.parameters[xpath_verify] = request_data['response_verify'];
        //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));
    
        var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,uri,request_body_data[0],headers);
        this.parameters[service_html_temp[0]] = service_html_temp[1];
    
        //assigning dynamic vars to this.parameters so that we can globally use it
        if(request_body_data[1]) {
            for(var i=0 ; i<request_body_data[1].length ; i ++) {
                this.parameters[request_body_data[1][i].name] = request_body_data[1][i].value ;
            }
        }
        else {
            //console.log('dynamic array not passed')
        }
    
        //preparing report list
        var temp_execution_report_list =[];
        if(this.parameters['execution_report_list']) {
        temp_execution_report_list = this.parameters['execution_report_list']
        }
        temp_execution_report_list.push(service_html_temp[0])
        this.parameters['execution_report_list'] = temp_execution_report_list
    
    });


// this method allows dynamic service calls
Given('I make {string} service call for {string} with below request details {string}', {timeout: 60 * 1000}, function(verb, servicename, input_request_data, done) {
    var request_map = DAO.createJSON_fromString(input_request_data);
    //console.log("request mapping json is" + JSON.stringify(request_map));

    var request_data = DAO.getTestdata(this.parameters,request_map);
    //console.log('request body actual data is'+JSON.stringify(request_data));

    var uri =  request_data['uri_value'];
    //console.log('uri value is'+ (uri));
    var request_body_data = DAO.getRequestBody(this.parameters,request_data);

    var headers = DAO.getRequestHeaders(this.parameters,request_data);
    //console.log('header value is'+ JSON.stringify(headers));
    var request_url = DAO.getRequestURL(this.parameters.protocol, this.parameters.host, request_data.host);
    //console.log('request_url value is'+ JSON.stringify(request_url));
    

        // JOHN for OAUTH2
        getBearer(request_url).then(function(id_token){
            headers.Authorization = "Bearer " + id_token;
            chai.request(request_url)
                [verb](uri)
                .set(headers)
                // .send(request_body_data[0])
                .end(function(err, res) {
                    if (err) {
                        console.log(verb + "service call err" + err)
                        return done(err);
                    }
                    // console.log("res.body" + res.body)
                    if (res.body === ""){
                        res.body = {}
                    }
                    DAO.setGlobalresponse(res.status,res.body,res.header);
                    done();
                });
        })
        .catch(function(err){
            return done(err);
        });

    var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
    this.parameters[xpath_verify] = request_data['response_verify'];
    //console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));

    var service_html_temp = DAO.setReportName(this.scenario,servicename,request_url,uri,request_body_data[0],headers);
    this.parameters[service_html_temp[0]] = service_html_temp[1];

    //assigning dynamic vars to this.parameters so that we can globally use it
    if(request_body_data[1]) {
        for(var i=0 ; i<request_body_data[1].length ; i ++) {
            this.parameters[request_body_data[1][i].name] = request_body_data[1][i].value ;
        }
    }
    else {
        //console.log('dynamic array not passed')
    }

    //preparing report list
    var temp_execution_report_list =[];
    if(this.parameters['execution_report_list']) {
    temp_execution_report_list = this.parameters['execution_report_list']
    }
    temp_execution_report_list.push(service_html_temp[0])
    this.parameters['execution_report_list'] = temp_execution_report_list

});


//this method is used to compare status code 
When("response status code is {int}", function(expected_responsecode, done) {
    var global_response = DAO.getGlobalresponse();
    global_response[0].should.equal(expected_responsecode);
    done();

});

//this method is used to compare status code and array/object/string
When("response is an {string} and status code is {int}", function(objecttype, expected_responsecode, done) {
    var global_response = DAO.getGlobalresponse();
    global_response[0].should.equal(expected_responsecode);
    global_response[1].should.be.an(objecttype);
    done();

});

When("response is an {string}", function(objecttype, done) {
    var global_response = DAO.getGlobalresponse();
    var expected_response_code = DAO.getExpectedResponseCode();
    console.log("$$$$$ Expected Response Code : "+expected_response_code);
    if(expected_response_code){
        global_response[0].should.equal(expected_response_code);
    }
    global_response[1].should.be.an(objecttype);
    done();

});


//this method can be used in scenario outlines to get expected values in string format(before comparing again converting string to table)
Then('I verify {string} service response to have expected values', function(servicename, done) {

    var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
    var report_name = DAO.getReportName(this.scenario,servicename);

    //converts the xpath value mentioned in test data into an array
    var data = DAO.convertXpathtoArray(this.parameters,xpath_verify);
    //console.log('data is'+JSON.stringify(data));

    //updates report with status code, status desc and status as fail
    var service_html_temp = DAO.setReportStatusFields(this.parameters,report_name,data);
    this.parameters[report_name] = service_html_temp;

    //compare expected and actual -  if passed, update the report as passed
    var execution_status = DAO.compareActual_Expected(data);
    service_html_temp['execution_status'] = execution_status;
    this.parameters[report_name] = service_html_temp;
    done();

});

//this method is used to store the xpath into json object with specificed name
Then('I Store {string} value into {string} as {string}', function(xpath, storage_name, type, done) {

    var global_response = DAO.getGlobalresponse();
    var temp_key = storage_name;
    var temp_value = jp.query(global_response[1], '$.' + xpath)
    if (type == 'string') {
        temp_value = temp_value.toString();
    }
    this.parameters[temp_key] = temp_value;
    //console.log(storage_name + " added to this.parameters - value is"+JSON.stringify(this.parameters));
    done();

});

Then('I Store Response_cookie {string} value into {string} for {string}', function(xpath, storage_name, type, done) {

    var global_response = DAO.getGlobalresponse();
    var temp_key = storage_name.split(';');
    var temp_value = '';
    var temp_cookies = global_response[3].split(';');
    var temp_xpath = xpath.split(';');

    for (var a = 0; a < temp_xpath.length; a++) {
        for (var i = 0; i < temp_cookies.length; i++) {
            if (temp_cookies[i].includes(temp_xpath[a])) {
                var temp_storage = temp_cookies[i].split(temp_xpath[a] + '=');

                if (type == 'request_body') {
                    temp_value = temp_storage[1];
                } else {
                    temp_value = temp_value + ';' + temp_xpath[a] + '=' + temp_storage[1];
                }
                //console.log('in if loop temp_cookies '+ i +':' + temp_cookies[i]);
                //console.log('temp length'+temp_storage.length +'temp_storage is '+temp_storage[1]);
                break;
            }
        }
        if (type == 'request_body') {
            this.parameters[temp_key[a]] = temp_value;
        }
    }

    // assign to global parametrs only once -
    if (type == 'request_headers') {
        this.parameters[temp_key[0]] = temp_value;
    }

    //console.log('temp_test_jsonpath value is' + JSON.stringify(temp_value));
    //console.log(storage_name + " added to this.parameters - value is" + JSON.stringify(this.parameters));
    done();

});

Then('I connect to database and execute {string} query and DB details are {string}', function(db_operation, input_request_data) {

    console.log('i am in then - db flow')
    var request_map = DAO.createJSON_fromString(input_request_data);
    var dbdata = DAO.getTestdata(this.parameters,request_map);
    console.log('test', JSON.stringify(dbdata));

        var db_env =  dbdata['db_env'];
        var db_query = dbdata['db_query'];

     ODB.oracledbConnect(db_env,db_query,db_operation);


});

Given('I make XML_POST service call for {string} with below request details {string}', {timeout: 60 * 1000}, function(servicename,input_request_data,done) {

    var parameters_input = this.parameters;
    var temp_xml_response = "";
    var request_map = DAO.createJSON_fromString(input_request_data);
    //console.log("request mapping json is" + JSON.stringify(request_map));

    var request_data = DAO.getTestdata(this.parameters,request_map);
    //console.log('request body actual data is'+JSON.stringify(request_data));

    var uri =  request_data['uri_value'];
    var url = parameters_input.protocol + "://" + parameters_input.host +  uri ;
    var request_body_data = DAO.getRequestBody(this.parameters,request_data);

    var headers = DAO.getRequestHeaders(this.parameters,request_data);
    //console.log('header value is'+headers);

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
xhr.open('POST', url, true);

xhr.setRequestHeader('Content-Type', 'application/xml');
xhr.setRequestHeader('Accept', 'application/xml');
xhr.send(request_body_data[0]);

xhr.onreadystatechange = function() {//Call a function when the state changes.
    if(xhr.readyState == 4) {
        //console.log(xhr.responseText);
        //DAO.xml_setGlobalresponse(xhr.status , xhr.responseText);
        var parseString = require('xml2js').parseString;
    parseString(xhr.responseText, { explicitArray : false}, function (err, result) {
        temp_xml_response = result;

    });
    //console.dir("result xml is "+ temp_xml_response );
    DAO.setGlobalresponse(xhr.status ,temp_xml_response, 'noresponseheaders');
    DAO.xml_setGlobalresponse(xhr.status ,xhr.responseText);
    done();
    }
}

var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
this.parameters[xpath_verify] = request_data['response_verify'];
//console.log('verifyservice_ parameters is'+ JSON.stringify(this.parameters));

 //assigning dynamic vars to this.parameters so that we can globally use it
 if(request_body_data[1]) {
        for(var i=0 ; i<request_body_data[1].length ; i ++) {
            this.parameters[request_body_data[1][i].name] = request_body_data[1][i].value ;
        }
    }
    else {
        console.log('dynamic array not passed')
    }

var service_html_temp = DAO.setReportName(this.scenario,servicename,parameters_input.host,uri,request_body_data[0],headers);
this.parameters[service_html_temp[0]] = service_html_temp[1];
//console.log('executionreport_ parameters is'+ JSON.stringify(this.parameters));

});


//this method is used to COUNT the number of occcurences of the xpath into json object with specificed name - updated by Arun
Then('I verify {string} service response to have {string} value {int} times', function(servicename, xpath, count_value, done) {

    var global_response = DAO.getGlobalresponse();
    var temp_key = count_value;
    var temp_value = jp.query(global_response[1], '$.' + xpath)
    var count =  (JSON.stringify(global_response).split(xpath).length - 1);
    var report_name = DAO.getReportName(this.scenario,servicename);
    var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);

   //converts the xpath value mentioned in test data into an array
    var data = DAO.convertXpathtoArray(this.parameters,xpath_verify);

   //console.log("Actual : "+count+ " Expected : "+count_value);
   //updates report with status code, status desc and status as fail
    var service_html_temp = DAO.setReportStatusFields(this.parameters,report_name,data);
    this.parameters[report_name] = service_html_temp;

   if(count == count_value){
    //console.log("Passed");
    execution_status = "passed";
    }else{
     execution_status = "failed";
    }

    //compare expected and actual -  if passed, update the report as passed
    service_html_temp['execution_status'] = execution_status;
    this.parameters[report_name] = service_html_temp;
    count.should.equal(count_value);

    done();

});

//this method is used to COUNT the number of occcurences of the xpath into json object with specificed name - udpated by Arun
Then('I validate {string} service response to have valid date value {string}', function(servicename, xpath, done) {

    var global_response = DAO.getGlobalresponse();
    //console.log("response-------> " + JSON.stringify(global_response));
    var resp_date = new Date(jp.query(global_response[1], '$.' + xpath));
    var report_name = DAO.getReportName(this.scenario,servicename);
    var xpath_verify = DAO.set_get_XpathToVerify(this.scenario,servicename);
    //console.log("resp_date: " + resp_date )

    var resp_date_dd = resp_date.getDate();
    var resp_date_mm = resp_date.getMonth()+1;
    var resp_date_yyyy = resp_date.getFullYear();

    //console.log("resp_date_dd: "+ resp_date_dd+"resp_date_mm: "+ resp_date_mm+"resp_date_yyyy: "+ resp_date_yyyy);

   //converts the xpath value mentioned in test data into an array
    var data = DAO.convertXpathtoArray(this.parameters,xpath_verify);

   //updates report with status code, status desc and status as fail
   var service_html_temp = DAO.setReportStatusFields(this.parameters,report_name,data);
   this.parameters[report_name] = service_html_temp;

   var today = new Date();
   var today_dd = today.getDate();
   var today_mm = today.getMonth()+1;
   var today_yyyy = today.getFullYear();

  execution_status = "failed";

  if (resp_date_dd >= today_dd)
   {
     execution_status = "passed"
   } else
     { if(resp_date_mm > today_mm)
        {
            execution_status = "passed"
        } else
        { if (resp_date_yyyy > today_yyyy)
            {
                 execution_status = "passed"
            }
         }
     }

    //compare expected and actual -  if passed, update the report as passed
    service_html_temp['execution_status'] = execution_status;
    this.parameters[report_name] = service_html_temp;

   if (isNaN(resp_date_dd))
    {
    console.log("Error: Invalid/Blank Date returned in the response.")
    expect(resp_date_dd,"Response Date is not VALID").to.not.be.NaN
    }

    if (execution_status == 'failed')
    {
        if(today_dd<10) { today_dd='0'+today_dd }
        if(today_mm<10) { today_mm='0'+today_mm }
        today = today_yyyy+'-'+today_mm+'-'+today_dd

        resp_date = resp_date.toISOString().split('T')[0]

        resp_date.should.equals(today)
    }

    done();

});

//this method is used to merge the two values with specificed name - updated by Sampath

Then('I merge {string} and {string} value into {string} as {string}', function (string, string2, string3, string4,done) {

    var temp_key = string3;
    var temp_key1=string;
    var temp_key2=string2;

    this.parameters[temp_key] =this.parameters[temp_key1]+'T'+this.parameters[temp_key2];
    console.log("FInal date and slot is "+JSON.stringify(this.parameters[temp_key]));
    done();

});

//this method is used to validate whether the field is not null - updated by Arun

Then('I validate field {string} in {string} service to be not NULL', function (xpath,servicename,done) {

    var global_response = DAO.getGlobalresponse();
    var temp_value = jp.query(global_response[1], '$.' + xpath)
    //console.log("temp_value:  "+temp_value)

    should.not.equal(temp_value, null, "NULL value is not expected!!");

    done();

});
