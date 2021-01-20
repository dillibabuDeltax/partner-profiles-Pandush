//Require the dev-dependencies
const {
    Given,
    When,
    Then
} = require("cucumber");
var fs = require('fs');
var os = require('os');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;


//const gbl = require('../api-bdd-framework/global_step_definitions/global_allstacks.js');
Then('I generate cucumber report', function(done) {

    console.log('generating cucumber report');
    execute('node reports/index.js');

    function execute(command) {
        const exec = require('child_process').exec

        exec(command, (err, stdout, stderr) => {
            process.stdout.write(stdout)
        })
    }
    done();

});

Then('I generate custom report', function(done) {

    console
    var subject = this.parameters['report_name'];
       fs.writeFile('reports/custom_executionreport.json', JSON.stringify(this.parameters) ,  (err) => {
        if (err) throw err;
        console.log('execution json file is created');
    });

    var style = ' <style type="text/css">'  +
    '.tg  {border-collapse:collapse;border-spacing:0;}' +
    '.tg td{font-family:Helvetica, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}' +
    '.tg th{font-family:Helvetica, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}' +
    '.tg .tg-w747{background-color:#dae8fc;text-align:left;vertical-align:top}' +
    '.tg .tg-w748{background-color:#FF0000 ;text-align:left;vertical-align:top ; }' +
    '.tg .tg-0lax{text-align:left;vertical-align:top}' +
    '</style>'

    var htmlContent = '<html> <title>BDD API Automation Execution Report</title> <body> <h2> BDD Service Automation Report </h2>' + style + '<table class="tg">'+
    '<tr> <th class="tg-w747">Category</th>'+
    '<th class="tg-w747">ServiceName</th>'+
    '<th class="tg-w747">Test Case Name</th>'+
    '<th class="tg-w747">Status</th>'+
    '<th class="tg-w747">statusCode</th>'+
    '<th class="tg-w747">statusDesc</th> </tr>';

    var htmlContent_fullreport = '<html> <head> <title>BDD API Execution Report</title> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">'+
    '<style type="text/css">.report-header {padding: 25px 0;text-align: center;}' +
    '.table-report {table-layout: fixed ;word-wrap: break-word;}' +
    '.table-info {width: 100%;margin: 0 auto;padding: 25px 0;} tr>th {font-weight: normal;' +
    'font-family: Trebuchet MS;background-color: #1778ab;color: black;border: 1px solid #1778ab !important;border-right: 1px solid #1778ab !important;}'+
    'tr>td {font-size: 11px !important; overflow-x: scroll; font-family: Trebuchet MS;} .highlighted {color: #fff;background-color: #1778ab;}</style></table>'+
    '</head> <body> <br> <div class="table-responsive report-contents"> <table class="table table-bordered table-report">'+
    '<tr> <th>Category</th>'+
    '<th>service/ServiceName</th>'+
    '<th>Test Case Name</th>'+
    '<th>Status</th>'+
    '<th>statusCode</th>'+
    '<th>statusDesc</th>'+
    '<th>host</th>'+
    '<th>uri</th>'+
    '<th>request</th>'+
    '<th>response</th>'+
    '<th>request_headers</th>'+
    '<th>response_headers</th> </tr>' ;

    var ExecReport = this.parameters['execution_report_list']
    var table = '';
    var table_fullreport = '';
    var appDReport = [];

    var date = new Date();
    var today_dd = date.getDate();
    var today_mm = date.getMonth()+1; 
    var today_yyyy = date.getFullYear();
    var today_hh = date.getHours();
    var today_MM = date.getMinutes();
    var today_ss = date.getSeconds();
    if(today_dd<10) { today_dd='0'+today_dd }; 
    if(today_mm<10) { today_mm='0'+today_mm };
    var todayDate = today_yyyy+'-'+today_mm+'-'+today_dd;
    var timestamp = "id:"+today_yyyy+today_mm+today_dd+today_hh+today_MM+today_ss

    for (var i = 0; i < ExecReport.length; i++) {
        
        let temp_report_data =  this.parameters[ExecReport[i]];
        let appDReport_JSON = {};

        //console.log('temp_report_data is'+ JSON.stringify(temp_report_data))
        var tr = "<tr>";
        var td1 = '<td class="tg-0lax">' + temp_report_data['category'] + "</td>";
        var td2 = '<td class="tg-0lax">' + temp_report_data['serviceName'] + "</td>";
        var td3 = '<td class="tg-0lax">' + temp_report_data['testCase'] + "</td>";
        var td4 = ''
        let test_status = temp_report_data['execution_status']
        if (test_status == 'passed') {
            td4 = '<td class="tg-0lax">' + test_status + "</td>";
        } else {
            td4 = '<td class="tg-w748">' + test_status + "</td>";
        }
        var td5 = '<td class="tg-0lax">' + temp_report_data['response_statusCode'] + "</td>";
        var td6 = '<td class="tg-0lax">' + temp_report_data['response_statusDesc'] + "</td>";
        var td7 = '<td class="tg-0lax">' + temp_report_data['request_url']  + "</td>";
        var td8 = '<td class="tg-0lax">' + temp_report_data['URI'] + "</td>";
        var td9 = '<td class="tg-0lax">' + temp_report_data['execution_request'] + "</td>";
        var td10 = '<td class="tg-0lax">' + JSON.stringify(temp_report_data['execution_response']) + "</td>";
        var td11 = '<td class="tg-0lax">' + JSON.stringify(temp_report_data['request_headers']) + "</td>";
        var td12 = '<td class="tg-0lax">' + JSON.stringify(temp_report_data['response_headers']) + "</td>";

        table += tr + td1 + td2 + td3 + td4 + td5 + td6;
        table_fullreport += tr + td1 + td2 + td3 + td4 + td5 + td6 + td7 + td8 + td9 + td10 + td11 + td12;
        appDReport_JSON = {
            id:timestamp,
            category:temp_report_data['category'],
            stack:this.parameters['stack'],
            group:this.parameters['report_name'],
            servicename:temp_report_data['serviceName'],
            testCase:temp_report_data['testCase'],
            status:temp_report_data['execution_status'],
            uri:temp_report_data['URI'].replace("/","_"),
            host:temp_report_data['request_url'],
            statuscode:temp_report_data['response_statusCode'],
            statusdesc:temp_report_data['response_statusDesc'],
            env:this.parameters['env'],
            date:todayDate,
            system_name:os.hostname()

        }
        appDReport.push(appDReport_JSON)
        // uri:temp_report_data['URI'],
    }
    console.log('appDReport is'+ JSON.stringify(appDReport));

    fs.writeFile('reports/appd_report.json', JSON.stringify(appDReport), (err) => {
        if (err) throw err;
        console.log('appDReport json file has been saved');
    });
    htmlContent = htmlContent + table + '</table> </body> </html>';
    htmlContent_fullreport = htmlContent_fullreport + table_fullreport + '</table> </div> </div> </body> </html>';

    //console.log('table is'+ htmlContent);
    htmlContent = htmlContent.replace(new RegExp('undefined', 'g'), 'skipped');
    htmlContent_fullreport = htmlContent_fullreport.replace(new RegExp('undefined', 'g'), 'skipped');

    fs.writeFile('reports/custom_report.html', htmlContent, (err) => {
        if (err) throw err;
        console.log('custom Report html file has been saved');
    });

    fs.writeFile('reports/custom_fullreport.html', htmlContent_fullreport, (err) => {
        if (err) throw err;
        console.log('Detailed custom Report html file has been saved');
    });
    var temp_env = this.parameters['host']
    var temp_subject = subject;
    var temp_old_date = new Date();
    var temp_date = new Date(Date.parse(temp_old_date)).toLocaleString();
    //console.log('temp_date is'+temp_date);
    fs.writeFile('reports/custom_subject.txt', temp_subject + ' : ' + temp_env + '-' + temp_date, (err) => {
        if (err) throw err;
        console.log('subject text file is created');
    });

    done();

});
