'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');

mongoose.Promise = global.Promise;

exports.getUser =function(req, res, next){
  var importedUser = req.body;
  User.findOne({ username: importedUser.username }).select('firstName lastName displayName username phone').exec(function(err, user){
    if(err) return res.status(500).send('Something went wrong, check console');
    if (!user) return res.status(500).send('could not find user: '+importedUser.username);
    else return res.json(user);
    
  });
};
