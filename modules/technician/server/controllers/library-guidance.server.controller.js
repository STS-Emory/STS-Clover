'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  LibraryGuidance = mongoose.model('LibraryGuidance');

mongoose.Promise = global.Promise;

exports.log = function (req, res) {
  var event = new LibraryGuidance(req.body);
  event.user = req.user;

  event.save(function(err){
    if(err){
      console.error(err);
      res.sendStatus(500);
    }
    else res.sendStatus(200);
  });
};

exports.stats = function (req, res){
  var year = parseInt(req.params.year);
  var start = new Date(year, 0, 1, 0, 0, 0),
    end = new Date(year+1, 0, 1, 0, 0, 0);

  LibraryGuidance.find({ created: { '$gte': start, '$lt': end } })
    .sort('created').exec(function(err, results){
      if(err){
        console.error(err);
        res.sendStatus(500);
      }
      else{
        var map = { },
          object = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
        results.forEach(function(obj){
          if(!map[obj.task]) map[obj.task] = 0;
          map[obj.task]++;
        });

        var idx, labels = Object.keys(map), size = labels.length, count = [];
        for(idx = 0; idx < size; idx++) count.push(new Array(12).fill(0));

        results.forEach(function(result){
          var month = result.created.getMonth();
          count[labels.indexOf(result.task)][month]++;
        });

        for(idx in labels) object[labels[idx]] = count[idx];

        res.status(200).json(object);
      }
    });
};
