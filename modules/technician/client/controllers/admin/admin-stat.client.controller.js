'use strict';

angular.module('technician.admin').controller('StatisticsController', ['$scope', '$http',
  function ($scope, $http) {

    var options = {
      responsive: true,
      maintainAspectRatio: true,
      scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
    };
    
    var createChart = function(id, type, data, options){
      return new Chart(document.querySelector('#'+id), { type: type, data: data, options: options });
    };

    var createBarDataset = function(label, data){
      var color = randomColor({ luminosity: 'dark', format: 'rgbArray' }).toString();
      return {
        label: label, data: data, borderWidth: 1,
        backgroundColor: 'rgba('+color+',0.6)',
        borderColor: 'rgba('+color+',1.0)',
        hoverBackgroundColor: 'rgba('+color+',0.8)',
        hoverBorderColor: 'rgba('+color+',1.0)'
      };
    };
    
    $scope.initLibraryGuidanceStat = function(){
      if($scope.LibraryGuidanceBarChart) $scope.LibraryGuidanceBarChart.clear();
      if($scope.CategoryTotal) delete $scope.CategoryTotal;

      if(!$scope.year) $scope.year = new Date().getFullYear();
      $http.get('/api/tech/library-guidance/stat/'+$scope.year)
        .success(function(stats){
          var idx, label, data = { labels: stats.labels, datasets: [] };
          delete stats.labels;

          var MonthlyTotal = new Array(data.labels.length).fill(0);
          for(label in stats) for(idx in stats[label])
            MonthlyTotal[idx] += stats[label][idx];
          stats.Total = MonthlyTotal;

          for(label in stats)
            data.datasets.push(createBarDataset(label, stats[label]));
          $scope.LibraryGuidanceBarChart = createChart('LibraryGuidanceBarChart', 'bar', data, options);

          var total, CategoryTotal = [], count = function(val){ total += val; };
          for(label in stats){
            total = 0; stats[label].forEach(count);
            CategoryTotal.push({ label: label, count: total });
          }
          $scope.CategoryTotal = CategoryTotal;
        });
    };
  }
]);
