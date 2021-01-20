console.log("I am in World start");

var {
    setWorldConstructor,
    Before
} = require('cucumber');

function World({attach,parameters}) {
    this.attach = attach
    this.parameters = parameters
    //console.log('parameters value is:'+JSON.stringify(this.parameters));
}

Before(function(feature) {
    this.scenario = feature;
    //console.log('scenario value is:'+JSON.stringify(this.scenario));
});

setWorldConstructor(World)