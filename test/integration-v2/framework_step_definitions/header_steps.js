//Require the dev-dependencies
const {
    Then} = require("cucumber");
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const DAO = require('./Util.js');

Then('response header {} should be {}', function (header,value) {
    header = header.toLowerCase();
    var global_response = DAO.getGlobalresponse();
    // console.log(global_response)
    var headers = global_response[2];
    expect(Object.keys(headers)).to.include(header);
    expect(headers[header]).to.equal(value);
});

Then('response header {} should not exist', function (header) {
    header = header.toLowerCase();
    var global_response = DAO.getGlobalresponse();
    var headers = global_response[2];
    expect(Object.keys(headers)).to.not.include(header);
});

Then('response header {} should exist', function (header) {
    header = header.toLowerCase();
    var global_response = DAO.getGlobalresponse();
    var headers = global_response[2];
    expect(Object.keys(headers)).to.include(header);
});

var token;
// this should return a promise with the bearer token
// it is only used in global_allstacks.js
function getBearer(request_url, b64){
   if(!b64 && token){
       return Promise.resolve(token);
   }
   if (!b64){
       b64 = "c2l3NEgxdm1WTHRNVmcxYVBpb3JramxHMlBQaTYxdEU6Tk96cGhDOVRhWXdxT0pyVA=="
   }
    return chai.request(request_url)
    .post("/oauth2/v1/token")
    .type('form')
    .set({"Content-Type":"application/x-www-form-urlencoded",
    // TODO: make this easier to change (maybe take from platform config, external project in Git)
        "Authorization":"Basic " + b64})
    .send({"grant_type":"client_credentials"})
    .then(function(res, err){
        if (res && res.text){
            // console.log("getBearer RES " + JSON.parse(res.text).id_token);
            token = JSON.parse(res.text).access_token
            return token;
        }
        console.log("****  getBearer MAJOR ERROR *****" + JSON.stringify(err))
        return err;
    })
};

function getAuthorizationResponse(request_url, add_scope){
    var scope = "openid";
    if(add_scope){
        scope = scope+" "+add_scope;
    }
    let resp = {    nonce: DAO.getNonce(), 
                    state: DAO.getNonce(),
                    scope: scope
                };
    return chai.request(request_url)
        .get('/retail/oauth2/v1/authorize')
        .query({client_id: 'siw4H1vmVLtMVg1aPiorkjlG2PPi61tE', 
                redirect_uri:'http://apigee-tools.example.com/oidc/callback-handler.html',
                response_type: 'code',
                scope: scope,
                state: resp.state,
                nonce: resp.nonce}) 
        .redirects(0)        
        .then(function(res, err){
            if (res && res.status == 302){
                const location = res.header['location'] ;
                var regex = /[?&]([^=#]+)=([^&#]*)/g,
                params = {},
                match;
                while(match = regex.exec(location)) {
                    params[match[1]] = match[2];
                }
                resp['sessionid'] = params['sessionid']
                return resp ;
            }
            console.log("****  authorize call failed *****" + JSON.stringify(err))
            return err;
        }) ;       
}

function getAuthenticationResponse(request_url, sessionid)   {
    let resp = {};
    let request_body_data = {  
        username: "testcarepass_1@gmail.com",
        password: "abcd1234", 
        sessionid: sessionid 
    } ;
    return chai.request(request_url)
        .post('/retail/oauth2/v1/authenticate')
        .set({"Content-Type":"application/json","Accept":"application/json"})
        .send(JSON.stringify(request_body_data))
        .then(function(res, err) {
            if (res && res.status == 200){
                //console.log("Authentication res.body " + JSON.stringify(res.body));
                resp['authcode'] = res.body.authcode;
                return resp ;
            }
            console.log("****  Authenticate call failed *****" + JSON.stringify(err))

            if (err) {
                console.log("POST service call err" + err)
                return done(err);
            }
        });      
}

function getAccessTokenResponse(request_url, authcode){
    console.log('--- Auth Code ---'+authcode);
    let resp = {};
    let data = {};
    data["grant_type"] = "authorization_code";
    data["redirect_uri"] = "http://apigee-tools.example.com/oidc/callback-handler.html";
    data["code"] = authcode;
    return chai.request(request_url)
        .post('/retail/oauth2/v1/token')
        .type('form')
        .set({"Content-Type":"application/x-www-form-urlencoded",
            "Authorization":"Basic c2l3NEgxdm1WTHRNVmcxYVBpb3JramxHMlBQaTYxdEU6Tk96cGhDOVRhWXdxT0pyVA=="})
        .send(data)
        .then(function(res, err) {
            if (res && res.status == 200){
                //console.log("Token call res.body " + JSON.stringify(res.body));
                resp['access_token'] = res.body.access_token;
                resp['refresh_token'] = res.body.refresh_token;
                return resp ;
            }
            console.log("****  Token call failed *****" + JSON.stringify(err))

            if (err) {
                console.log("POST service call err" + err)
                return done(err);
            }

            
        });      
}



module.exports = {getBearer, getAuthorizationResponse, getAuthenticationResponse, getAccessTokenResponse};