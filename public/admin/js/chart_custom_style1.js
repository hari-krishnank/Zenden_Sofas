/*------------------------------------------------------------------
    File Name: chart_custom_style1.js
    Template Name: Pluto - Responsive HTML5 Template
    Created By: html.design
    Envato Profile: https://themeforest.net/user/htmldotdesign
    Website: https://html.design
    Version: 1.0
-------------------------------------------------------------------*/	

     var color = Chart.helpers.color;

	 //___________Monthly Sales Data______________
	 var jan = document.getElementById('jan').value;
	 var feb = document.getElementById('feb').value;
	 var mar = document.getElementById('mar').value;
	 var apr = document.getElementById('apr').value;
	 var may = document.getElementById('may').value;
	 var jun = document.getElementById('jun').value;
	 var jul = document.getElementById('jul').value;
	 var aug = document.getElementById('aug').value;
	 var sep = document.getElementById('sep').value;
	 var oct = document.getElementById('oct').value;
	 var nov = document.getElementById('nov').value;
	 var dec = document.getElementById('dec').value;


	 var janUsers = parseInt(document.getElementById('JAN').value);
	 var febUsers = parseInt(document.getElementById('FEB').value);
	 var marUsers = parseInt(document.getElementById('MAR').value);
	 var aprUsers = parseInt(document.getElementById('APR').value);
	 var mayUsers = parseInt(document.getElementById('MAY').value);
	 var junUsers = parseInt(document.getElementById('JUN').value);
	 var julUsers = parseInt(document.getElementById('JUL').value);
	 var augUsers = parseInt(document.getElementById('AUG').value);
	 var sepUsers = parseInt(document.getElementById('SEP').value);
	 var octUsers = parseInt(document.getElementById('OCT').value);
	 var novUsers = parseInt(document.getElementById('NOV').value);
	 var decUsers = parseInt(document.getElementById('DEC').value);

	 

	 
	
var barChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    datasets: [{
        type: 'bar',
        label: 'SALES',
        backgroundColor: [
            'rgba(255, 152, 0, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(255, 87, 34, 1)',
            'rgba(0, 150, 136, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(21, 40, 60, 1)',
            'rgba(9, 113, 184, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(255, 87, 34, 1)',
            'rgba(0, 150, 136, 1)',
            'rgba(255, 152, 0, 1)',
        ],
        borderColor: [
            'rgba(255, 152, 0, 1)',
            'rgba(103, 58, 183, 1)',
            'rgba(233, 30, 99, 1)',
            'rgba(0, 150, 136, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(21, 40, 60, 1)',
            'rgba(9, 113, 184, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(103, 58, 183, 1)',
            'rgba(233, 30, 99, 1)',
            'rgba(0, 150, 136, 1)',
            'rgba(255, 152, 0, 1)',
        ],
        data: [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    },{
		type: 'line',
		label: 'USERS',
		backgroundColor: [
			 'rgba(255, 87, 34, 1)',
			 'rgba(103, 58, 183, 1)',
			 'rgba(233, 30, 99, 1)',
			 'rgba(0, 150, 136, 1)',
			 'rgba(255, 152, 0, 1)',
			 'rgba(21, 40, 60, 1)',
			 'rgba(9, 113, 184, 1)',
		],
		borderColor: [
			 'rgba(255, 87, 34, 1)',
			 'rgba(103, 58, 183, 1)',
			 'rgba(233, 30, 99, 1)',
			 'rgba(0, 150, 136, 1)',
			 'rgba(255, 152, 0, 1)',
			 'rgba(21, 40, 60, 1)',
			 'rgba(9, 113, 184, 1)',
		],
		data: [janUsers, febUsers, marUsers, aprUsers, mayUsers, junUsers, julUsers, augUsers, sepUsers, octUsers, novUsers, decUsers]
	
    }]
};
	 
	 var monthlyData = [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec];
	 
	 // Define a plugin to provide data labels
	 Chart.plugins.register({
		 afterDatasetsDraw: function(chart) {
			 var ctx = chart.ctx;
	 
			 chart.data.datasets.forEach(function(dataset, i) {
				 var meta = chart.getDatasetMeta(i);
				 if (!meta.hidden) {
					 meta.data.forEach(function(element, index) {
						 // Draw the text in black, with the specified font
						 ctx.fillStyle = 'rgb(0, 0, 0)';
	 
						 var fontSize = 0;
						 var fontStyle = 'normal';
						 var fontFamily = 'Helvetica Neue';
						 ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
	 
						 // Just naively convert to string for now
						 var dataString = dataset.data[index].toString();
	 
						 // Make sure alignment settings are correct
						 ctx.textAlign = 'center';
						 ctx.textBaseline = 'middle';
	 
						 var padding = 5;
						 var position = element.tooltipPosition();
						 ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
					 });
				 }
			 });
		 }
	 });
	 
	 window.onload = function() {
		 var ctx = document.getElementById('myChart').getContext('2d');
		 window.myBar = new Chart(ctx, {
			 type: 'bar',
			 data: barChartData,
			 options: {
				 responsive: true,
				 title: {
					 display: false,
					 text: 'Chart.js Combo Bar Line Chart'
				 },
				 scales: {
					 yAxes: [{
						 ticks: {
							 suggestedMin: 0,
							 suggestedMax: 100
						 }
					 }]
				 }
			 }
		 });
	 };

	 document.getElementById('monthlyButton').addEventListener('click', function() {
		// Update chart data for monthly sales and users
		window.myBar.data.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		window.myBar.data.datasets[0].data = [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec];
		window.myBar.data.datasets[1].data = [janUsers, febUsers, marUsers, aprUsers, mayUsers, junUsers, julUsers, augUsers, sepUsers, octUsers, novUsers, decUsers];
		window.myBar.update();
	});
	

	 document.getElementById('yearlyButton').addEventListener('click', function() {
		// Update chart data for yearly sales and users
		window.myBar.data.labels = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"];
		window.myBar.data.datasets[0].data = [parseInt(document.getElementById('2018').value),
											  parseInt(document.getElementById('2019').value),
											  parseInt(document.getElementById('2020').value),
											  parseInt(document.getElementById('2021').value),
											  parseInt(document.getElementById('2022').value),
											  parseInt(document.getElementById('2023').value),
											  parseInt(document.getElementById('2024').value)
											 ];
		window.myBar.data.datasets[1].data = [ parseInt(document.getElementById('users2018').value),
											   parseInt(document.getElementById('users2019').value),
											   parseInt(document.getElementById('users2020').value),
											   parseInt(document.getElementById('users2021').value),
											   parseInt(document.getElementById('users2022').value),
											   parseInt(document.getElementById('users2023').value),
											   parseInt(document.getElementById('users2024').value)];
		window.myBar.update();
	});
	
	 document.getElementById('randomizeData').addEventListener('click', function() {
		 barChartData.datasets.forEach(function(dataset) {
			 dataset.data = dataset.data.map(function() {
				 return Math.floor(Math.random() * 100); // Randomize data
			 });
		 });
		 window.myBar.update();
	 });