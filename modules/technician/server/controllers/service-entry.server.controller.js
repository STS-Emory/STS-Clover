'use strict';

var mongoose = require('mongoose'),
  ServiceEntry = mongoose.model('ServiceEntry');

mongoose.Promise = global.Promise;

exports.update = function (req, res) {
  var entry = req.body;
  ServiceEntry.findOneAndUpdate({ _id : entry._id }, entry, function(err, entry){
    if(err) { console.error(err); return res.sendStatus(500); }
    else res.json(entry);
  });
};

exports.remove = function (req, res) {
  var entry = req.body;
  ServiceEntry.findOneAndRemove({ _id : entry._id }, function(err){
    if(err) { console.error(err); return res.sendStatus(500); }
    else res.sendStatus(200);
  });
};
