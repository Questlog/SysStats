var connection;
var ramChart;
var ramChartData = [];
var cpuChart;
var cpuChartData = [];
var viewModel;

function refresh(json){
  var time = new Date();
  //ramChart.yAxis[0].setExtremes(null,json['totalmem']);
  ramChartData.push({
      x: time,
      y: json['totalmem']-json['freemem']
  });

  cpuChartData.push({
      x: time,
      y: json['load']
  });

  if (cpuChartData.length > 150)
	{
		cpuChartData.shift();
		ramChartData.shift();
	}

  ramChart.render();
  cpuChart.render();


  var uptime = json['uptime'];
  var seconds = Math.round(uptime % 60); Math.round(uptime /= 60);
  var minutes = Math.round(uptime % 60); Math.round(uptime /= 60);
  var hours = Math.round(uptime % 24);   Math.round(uptime /= 24);
  var days = Math.round(uptime);

  viewModel.uptime(days + "d:"+ hours + "h:" + minutes + "m:" + seconds + "s");
}

$(function () {
  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  connection = new WebSocket('ws://worfox.net:1337');

  connection.onopen = function () {
      // connection is opened and ready to use
  };

  connection.onerror = function (error) {
      // an error occurred when sending/receiving data
  };

  connection.onmessage = function (message) {
      // try to decode json (I assume that each message from server is json)
      try {
          var json = JSON.parse(message.data);
          //alert(message.data);
          refresh(json);
      } catch (e) {
          console.log(e);
          return;
      }
      // handle incoming message
  };


  function WfxViewModel() {
      var self = this;
      self.uptime = ko.observable(0);
  }
  viewModel = new WfxViewModel();
  ko.applyBindings(viewModel);

  ramChart = new CanvasJS.Chart("ramChart",{
			title :{
				text: "Ram"
			},
      axisX :{
  			labelAngle: -30
  		},
			data: [{
				type: "line",
				dataPoints: ramChartData
			}]
		});

  cpuChart = new CanvasJS.Chart("cpuChart",{
			title :{
				text: "Cpu"
			},
      axisX :{
  			labelAngle: -30
  		},
			data: [{
				type: "spline",
				dataPoints: cpuChartData
			}]
		});


  setInterval(function(){
    connection.send('getStats');
  }, 100);
});
