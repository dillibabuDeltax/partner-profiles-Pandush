const jp = require('jsonpath');
const chai = require('chai');
var dao = {};

var service_response;
var service_response_code;
var service_response_headers;
var service_response_cookies;
var xml_service_response;
var xml_service_response_code;
var expected_response_code;


//this function is to take comma separated string and convert to json
dao.createJSON_fromString = function(input_request_data) {
    var temp_request_data = input_request_data.split(";");
    var temp_request_map = {};
    for (var i = 0; i < temp_request_data.length; i++) {
        var request_input = temp_request_data[i].split("==");
        var temp_key = request_input[0].replace(" ", "");
        var temp_value = request_input[1].replace(" ", "");
        temp_request_map[temp_key] = temp_value;
        //console.log('request_map data values', request_map[temp_key]);
    }
    return temp_request_map;
}

//this function is to construct test data json object by looking at feature file values and input parameters
dao.getTestdata = function(parameters, request_map) {

    var data_path = parameters['datapath'];
    var data_env = parameters['dataenv'];
    var requirepath = '';
    var temp_json_path = request_map['file'];

    if (data_env !== '') {
        temp_json_path = temp_json_path.replace('.json', '_' + data_env + '.json');
    } else {
        temp_json_path = temp_json_path.replace('.json', data_env + '.json');
    }

    // JOHN changed for this API project
    requirepath = '../' + data_path + '/' + temp_json_path;
    console.log(temp_json_path)

    var data_file = require(requirepath);
    var request_data = data_file[request_map['test']];
    //Setting the expected response code 
    expected_response_code = request_data.http_response_code;
    //console.log('Setting expected response code:'+expected_response_code);

    return request_data;
}

//this function is to take provide request body
dao.getRequestBody = function(parameters, request_data) {

    var request_body_data = request_data['request_value'];
    if (request_data['replace_var']) {
        var temp_replace = request_data['replace_var'].split(';');
        for (var i = 0; i < temp_replace.length; i++) {
            request_body_data = request_body_data.replace(temp_replace[i], parameters[temp_replace[i]])
        }
    }

    if (request_data['dynamic_var']) {

        var random_num = Math.floor(Math.random() * 10000000000) 
        var temp_dynamic_var = request_data['dynamic_var'].split(';')
        
        var FinalDyamicVar = [];

        
      //var temp_replace = request_data['replace_var'].split(';');
      for (var j = 0; j < temp_dynamic_var.length; j++) {
        let final_replace_var;

        var temp_replace_dynamic_var = temp_dynamic_var[j].split('==');
        //console.log(temp_replace_dynamic_var[0], temp_replace_dynamic_var[1]);
        if(temp_replace_dynamic_var[1].includes('email')){
            let temp_random_value = temp_replace_dynamic_var[1].replace('email&','') ;
            final_replace_var = random_num+ temp_random_value;
            //console.log('final_replace_var in email',final_replace_var)
        }else if (temp_replace_dynamic_var[1].includes('phonenumber')) {
            final_replace_var = random_num ;
        }else if (temp_replace_dynamic_var[1].includes('timestamp')) {
            let temp_random_value = temp_replace_dynamic_var[1].replace('timestamp&','');
            //var temp_old_date = new Date();
            var date = new Date();
            var today_dd = date.getDate();
            var today_mm = date.getMonth()+1; 
            var today_yyyy = date.getFullYear();
            if(today_dd<10) { today_dd='0'+today_dd }; 
            if(today_mm<10) { today_mm='0'+today_mm };
            var today_01 = today_yyyy+'-'+today_mm+'-'+today_dd;
            //console.log('date yyyymmdd format ------- ', today_01);

            if(temp_random_value=='default') {
            //var temp_date = new Date(Date.parse(today_01)).toString();
            var temp_date = today_01;
            //temp_date = temp_date.replace(',','')
            //temp_date = temp_date.replace('/','-')
            final_replace_var = temp_date;
            console.log('date yyyymmdd format ------- ', final_replace_var);
            //This functionality will pass the timestamp(tomorrow's date) in the request body - udpated by Arun - line 99 to 114
            } else if (temp_random_value=='tomorrow') {
                  if (today_mm == 12 && today_dd == 31){
                   today_yyyy_tomorrow = Number(today_yyyy)+Number(1)
                   temp_date = today_yyyy_tomorrow+'-01-01'  
                  }else if(today_mm < 12 && today_dd >= 28) {
                   today_mm_tomorrow = Number(today_mm)+Number(1);
                   if(today_mm_tomorrow<10) { today_mm_tomorrow='0'+today_mm_tomorrow };
                   temp_date = today_yyyy + '-' + today_mm_tomorrow +'-01'
                  }else{
                   today_dd_tomorrow = Number(today_dd)+Number(1);
                   if(today_dd_tomorrow<10) { today_dd_tomorrow='0'+today_dd_tomorrow };
                   temp_date = today_yyyy + '-' + today_mm +'-' + today_dd_tomorrow
                } 
                final_replace_var = temp_date;
                console.log('tomorrow date yyyymmdd format ------->>> ', final_replace_var);   
            } else{
                final_replace_var = "no_date_assigned"
            }
        }
        //console.log('final_replace_var : j is' + j +":" +final_replace_var);
        var temp_FinalDyamicVar = {
            name: temp_replace_dynamic_var[0],
            value: final_replace_var
        }
        FinalDyamicVar.push(temp_FinalDyamicVar);

        request_body_data = request_body_data.replace(temp_replace_dynamic_var[0], final_replace_var)
         }
    }
    //console.log('request_body_data'+request_body_data);
    return [request_body_data, FinalDyamicVar]
}

//this function is to take provide request headers
dao.getRequestHeaders = function(parameters, request_data) {
    var headers = request_data['headers'];
    // JOHN make headers optional
    if (!headers || headers == ""){
        headers = {}
    }
    // John added to allow string or object in data/xxxx.json
    if (typeof headers === "object") {
        headers = JSON.stringify(headers);
    }

    if (request_data['replace_headers']) {
        var temp_replace_headers = request_data['replace_headers'].split(';');
        for (var i = 0; i < temp_replace_headers.length; i++) {
            headers = headers.replace(temp_replace_headers[i], parameters[temp_replace_headers[i]])
        }
    }
    if (headers) {
        headers = JSON.parse(headers);
    }
    // John added to piggyback on old settings, see platform-config-apigee
    if(parameters.mockFlag === true){
        headers["x-mock"] = "y";   
    }

    return headers;
}

//this function is to take provide request headers
dao.getRequestURL = function(protocol, default_host, custom_host) {

    var request_url = protocol +  '://' + default_host;
    if(custom_host){
        request_url = protocol +  '://' + custom_host;
    }
    return request_url;
}

//this function is to return variable name for storing xpath information
dao.set_get_XpathToVerify = function(scenario, servicename) {

    var report_scenario_name = jp.query(scenario, '$..name').toString();
    var temp_scenario_name = report_scenario_name.split("==");
    var verify_xpath = 'verifyservice_' + temp_scenario_name[0] + '_' + servicename + '_' + dao.getTestCaseName(scenario);
    //console.log('verify_name is'+verify_xpath)
    return verify_xpath;
}

//this function is to return variable name for Report and also set service, scenario and host details for Report.
dao.setReportName = function(scenario, servicename, host, uri, request_body, request_headers) {
    var service_html_temp = {};
    var report_scenario_name = jp.query(scenario, '$..name').toString();
    var temp_scenario_name = report_scenario_name.split("==");
    
    
    service_html_temp['serviceName'] = servicename ;
    service_html_temp['testCase'] = dao.getTestCaseName(scenario) ;
    service_html_temp['category'] = temp_scenario_name[0];
    service_html_temp['request_url'] = host;
    service_html_temp['URI'] = uri;

    // console.log('request_body'+JSON.stringify(request_body))

    if(request_body){

    // JOHN adding support for raw object
    if (typeof request_body === "object"){
        request_body = JSON.stringify(request_body);
    }

    if(request_body.includes('</')){
            service_html_temp['execution_request'] = "<xmp>" + request_body + "</xmp>";
    }else{
            service_html_temp['execution_request'] = request_body;
    }
    } else{
        service_html_temp['execution_request'] = "GET method, not request body exists";
    }

    if(request_headers){
    service_html_temp['request_headers'] = request_headers;
    }else {
        service_html_temp['request_headers'] = 'no headers passed';
    }

    var report_xpath = 'executionreport_' + temp_scenario_name[0] + '_' + servicename + '_' + dao.getTestCaseName(scenario);
    return [report_xpath, service_html_temp];
}

//this function is to get the report name
dao.getReportName = function(scenario, servicename) {

    var report_scenario_name = jp.query(scenario, '$..name').toString();
    var temp_scenario_name = report_scenario_name.split("==");
    var report_xpath = 'executionreport_' + temp_scenario_name[0] + '_' + servicename + '_' + dao.getTestCaseName(scenario);

    return report_xpath;
}

//this function is to set the Global response variables for service response.
dao.setGlobalresponse = function(status, body, responseheaders) {
    
    service_response_code = status;
    service_response = body;
    service_response_headers = responseheaders;

    if (JSON.stringify(service_response_headers).includes("set-cookie")) {
        service_response_cookies = service_response_headers['set-cookie'].toString();
    } else {
        service_response_cookies = '';
    }
    //console.log('inside setGlobalresponse'+service_response);
}


//this function is to set the Global response variables for xml service response.
dao.xml_setGlobalresponse = function(status, body) {
//console.log('in xml_setGlobalresponse'+ status + body);
    xml_service_response_code = status;
    xml_service_response = body;
    //console.log('in xml_setGlobalresponse assigned value is '+ xml_service_response );

}

//this function is to get global response fields.
dao.getGlobalresponse = function() {
    //console.log("service_response test me"+service_response_code);
    return [service_response_code, service_response, service_response_headers, service_response_cookies];

}

//this function is to get global xml_response fields.
dao.xml_getGlobalresponse = function() {
    return [xml_service_response_code, xml_service_response];

}


//this function is to convert multiple xpath and values into an array
dao.convertXpathtoArray = function(parameters, xpath_verify) {
    
    var expected_data = parameters[xpath_verify];
    //console.log("Expected Data:"+expected_data);
    if(typeof expected_data == "string"){
        
        var data = [];
        var temp_expected_data = expected_data.split(";");

        for (var i = 0; i < temp_expected_data.length; i++) {
            var expected_map = {};
            var temp_expected_input = temp_expected_data[i].split("&");
            for (var j = 0; j < temp_expected_input.length; j++) {
                var expected_input = temp_expected_input[j].split("==");
                var temp_key = expected_input[0].replace(" ", "");
                //console.log('temp_key in Then is '+temp_key)
                var temp_value = expected_input[1];
                expected_map[temp_key] = temp_value;
                // console.log('expected_map data values', expected_map[temp_key]);
            }
            data.push(expected_map);
            //console.log('data value in for loop is  ', data);

        }
        return data;
    }else{
        return dao.convertXpathtoArrayFromJSON(parameters, xpath_verify);
    }
    
    
}

//this function is to convert the verify json into [{xpath:'KEY1',value:'VALUE1'},{xpath:'KEY2',value:'VALUE2'}]
dao.convertXpathtoArrayFromJSON = function(parameters, xpath_verify) {
    var allowed_data_types = ['string','number','boolean'];
    var expected_data = parameters[xpath_verify];
    console.log('xpath_verify:'+JSON.stringify(expected_data));
    var verify_nodes = jp.nodes(expected_data,'$..*');

    var data = [];
    for(var i = 0; i < verify_nodes.length; i++){
        if(allowed_data_types.includes(typeof verify_nodes[i].value)){
            var expected_map = {};
            expected_map['xpath'] = verify_nodes[i].path.slice(1).join('.');
            expected_map['value'] = verify_nodes[i].value;
            data.push(expected_map);
        }
        
    }
    console.log(">> xpath data >>"+ JSON.stringify(data));    
    return data;
}

dao.compareActual_Expected = function(expected_data_compare) {

var data = expected_data_compare;
var temp_status_code = 'fail';
var global_response = dao.getGlobalresponse();

for (var i = 0; i < data.length; i++) {
    var actual_value = "";
    var expected_value = "";
    actual_value = jp.query(global_response[1], '$.' + data[i].xpath).toString();
    actual_value = actual_value.toUpperCase();
    expected_value = data[i].value.toUpperCase();
    if (!expected_value.includes("||")) {
        actual_value.should.equal(data[i].value.toUpperCase());
        temp_status_code = 'passed';
    } else {
        expected_value.should.contains(actual_value.toUpperCase());
        temp_status_code = 'passed';
    }
}
    return temp_status_code;
}


//this function is to update the Report status fields like status code, status desc, status as fail.
dao.setReportStatusFields = function(parameters, report_name, expected_data_compare) {

    var service_html_temp = parameters[report_name];
    var data = expected_data_compare;
  
    var global_response = dao.getGlobalresponse();
    var xml_global_response = dao.xml_getGlobalresponse();
    //console.log('response fields are'+JSON.stringify(global_response[1]));

    service_html_temp['response_statusCode'] = jp.query(global_response[1], '$.' + data[0].xpath).toString()
    // John temp removing. We may want to set this as statusDescription
    // service_html_temp['response_statusDesc'] = jp.query(global_response[1], '$.' + data[1].xpath).toString()
    service_html_temp['execution_status'] = 'failed';
    if(xml_global_response[1]) {
        service_html_temp['execution_response'] = "<xmp>" + xml_global_response[1] + "</xmp>";
    }else {
    service_html_temp['execution_response'] = global_response[1];
    }
    service_html_temp['response_headers'] = global_response[2];
    return service_html_temp;
}

 //Included getRequestURI to update the parameter value passed in uri value in runtime- updated by Arun
dao.getRequestURI = function(parameters, request_data) {       
       var request_uri = request_data['uri_value'];

    if (request_data['replace_var_uri']) {
        var temp_replace = request_data['replace_var_uri'].split(';');
        //console.log("temp_replace : " + temp_replace)
        for (var i = 0; i < temp_replace.length; i++) {
            request_uri = request_uri.replace(temp_replace[i], parameters[temp_replace[i]])
          //  console.log("temp_replace : " + temp_replace[i])
          //  console.log("parameter " + parameters[temp_replace[i]])
        }
    }
        
    if (request_data['dynamic_var_uri']) {
      var temp_dynamic_var = request_data['dynamic_var_uri'].split(';')
      var final_replace_var

      for (var j = 0; j < temp_dynamic_var.length; j++) {
        
        var temp_replace_dynamic_var = temp_dynamic_var[j].split('==');
        //console.log(temp_replace_dynamic_var[0], temp_replace_dynamic_var[1]);
        
        if (temp_replace_dynamic_var[1].includes('timestamp')) {
            let temp_random_value = temp_replace_dynamic_var[1].replace('timestamp&','');            
            var date = new Date();
            var today_dd = date.getDate();
            var today_mm = date.getMonth()+1; 
            var today_yyyy = date.getFullYear();
            if(today_dd<10) 
            { today_dd='0'+today_dd }; 
            if(today_mm<10) 
            { today_mm='0'+today_mm };
            var today_01 = today_yyyy+'-'+today_mm+'-'+today_dd; 

            if(temp_random_value=='default') {            
            var temp_date = today_01;
            final_replace_var = temp_date;            
            } else if (temp_random_value=='tomorrow') {

                  if (today_mm == 12 && today_dd == 31){
                   today_yyyy_tomorrow = Number(today_yyyy)+Number(1)
                   temp_date = today_yyyy_tomorrow+'-01-01'  
                 
                 }else if(today_mm < 12 && today_dd >= 28) {
                   today_mm_tomorrow = Number(today_mm)+Number(1);
                   if(today_mm_tomorrow<10) { today_mm_tomorrow='0'+today_mm_tomorrow };
                   temp_date = today_yyyy + '-' + today_mm_tomorrow +'-01'
                
                 }else{
                   today_dd_tomorrow = Number(today_dd)+Number(1);
                   if(today_dd_tomorrow<10) { today_dd_tomorrow='0'+today_dd_tomorrow };
                   temp_date = today_yyyy + '-' + today_mm +'-' + today_dd_tomorrow
                } 
                final_replace_var = temp_date;
                //console.log('tomorrow date yyyymmdd format ------->>> ', final_replace_var);
              }else if (temp_random_value=='dayPlus3') {
                  var today_dd_plus3 = date.getDate()+3;
                  if(today_dd_plus3<10) { today_dd_plus3='0'+today_dd_plus3 };
                 
                  if (today_mm == 12 && today_dd > 28){
                   today_yyyy_plus3 = Number(today_yyyy)+Number(1)
                   temp_date = today_yyyy_plus3+'-01'+  today_dd_plus3
                 
                 }else if(today_mm < 12 && today_dd > today_dd_plus3) {
                   today_mm_plus3 = Number(today_mm)+Number(1);
                   if(today_mm_plus3<10) { today_mm_plus3='0'+today_mm_plus3};
                   temp_date = today_yyyy + '-' + today_mm_plus3 +'-' + today_dd_plus3
                
                 }else{
                   temp_date = today_yyyy + '-' + today_mm +'-' + today_dd_plus3 
                } 
                final_replace_var = temp_date;
                //console.log('_plus3  date yyyymmdd format ------->>> ', final_replace_var);
              } else{
                final_replace_var = "no_date_assigned"
            }
        } else if (temp_replace_dynamic_var[1].includes('nonce')) {
            final_replace_var = dao.getNonce() ;
        }          
        request_uri = request_uri.replace(temp_replace_dynamic_var[0], final_replace_var)
        }
    }          
      return request_uri;
}

dao.getNonce = function() {
    var nonce = '' ;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 6; i++) {
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return nonce ;
}

dao.getTestCaseName = function(scenario)    {
    var ex = /test==(.*)\"\,/g ;
    return ex.exec(jp.query(scenario, '$..text').toString())[1];
}

//return the expected http_reponse_code , extracted from the request_data
dao.getExpectedResponseCode = function(){
    return expected_response_code;
}


module.exports = dao;
