/*jslint node: true */
"use strict";

var Bean = require('../');

var intervalId;
var connectedBean;

Bean.discover(function(bean){
  connectedBean = bean;
  process.on('SIGINT', exitHandler.bind(this));

  bean.on("accell", function(x, y, z, valid){
    var status = valid ? "valid" : "invalid";
    console.log("received " + status + " accell\tx:\t" + x + "\ty:\t" + y + "\tz:\t" + z );
  });

  bean.on("temp", function(temp, valid){
    var status = valid ? "valid" : "invalid";
    console.log("received " + status + " temp:\t" + temp);
  });

  bean.on("serial", function(data, valid){
    var status = valid ? "valid" : "invalid";
    console.log("received " + status + " serial");
    console.log(data);
  });

  bean.on("disconnect", function(){
    process.exit();
  });

  bean.connectAndSetup(function(){

    bean.notifyOne(function(data){
      console.log("scratch1");
      console.log(data);
    }, function(){
      console.log("notifying on scratch one");
    })

    var readData = function() {

      //set random led colors between 0-255. I find red overpowering so red between 0-64
      bean.setColor(getRandomInt(0,64), getRandomInt(0,255), getRandomInt(0,255),
        function(){
          console.log("led color sent");
      });

      bean.requestAccell(
      function(){
        console.log("request accell sent");
      });

      bean.requestTemp(
      function(){
        console.log("request temp sent");
      });

    }

    intervalId = setInterval(readData,1000);

  });

});

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

process.stdin.resume();//so the program will not close instantly
var triedToExit = false;

//turns off led before disconnecting
var exitHandler = function exitHandler() {

  var self = this;
  if (connectedBean && !triedToExit) {
    triedToExit = true;
    console.log('Turning off led...');
    clearInterval(intervalId);
    connectedBean.setColor(0, 0, 0, function(){});
    //no way to know if succesful but often behind other commands going out, so just wait 2 seconds
    console.log('Disconnecting from Device...');
    setTimeout(connectedBean.disconnect.bind(connectedBean, function(){}), 2000);
  } else {
    process.exit();
  }
};