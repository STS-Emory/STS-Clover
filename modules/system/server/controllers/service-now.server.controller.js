'use strict';

var fs = require('fs'),
  _ = require('lodash'),
  soap = require('soap'),
  async = require('async'),
  mongoose = require('mongoose'),
  Walkin = mongoose.model('Walkin'),
  Checkin = mongoose.model('Checkin');

mongoose.Promise = global.Promise;

// Get credentials (& reformat wsdl url)
var credentialFilePath = __dirname + '/../../../../config/credentials/ServiceNow.json',
  credentialFile = fs.readFileSync(credentialFilePath, 'utf8'),
  credential = JSON.parse(credentialFile);

if(credential.username){
  var index = credential.wsdl_url.indexOf('//') + '//'.length;
  credential.wsdl_url = credential.wsdl_url.substring(0, index) + credential.username + ':' + credential.password + '@' + credential.wsdl_url.substring(index);
}

var popOpt_walkin = [
  { path : 'user', model : 'User', select : 'username isWildcard' },
  { path : 'lastUpdateTechnician', model : 'User', select : 'username' },
  { path : 'serviceTechnician', model : 'User', select : 'username' },
  { path : 'resoluteTechnician', model : 'User', select : 'username' }
];

var popOpt_checkin = [
  { path : 'user', model : 'User', select : 'firstName lastName displayName username phone location verified isWildcard' },
  { path : 'walkin', model : 'Walkin', select : 'description resoluteTechnician deviceCategory deviceType os otherDevice' },
  { path : 'serviceLog', model : 'ServiceEntry', select : 'type description createdBy createdAt' },
  { path : 'completionTechnician', model : 'User', select : 'username displayName' },
  { path : 'verificationTechnician', model : 'User', select : 'username displayName' },
  { path : 'checkoutTechnician', model : 'User', select : 'username displayName' }
];

var popOpt_checkin_walkin = [{ path : 'walkin.resoluteTechnician', model : 'User', select : 'username displayName' }];

var getEscapedXMLCharacters = function(string) {
  return string? string.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;') : string;
};

var getWalkinTemplateObj = function(walkin){
  var subject = 'STS: ', dinfo = walkin.deviceInfo;
  var obj = { short_description: '', category1 : '', category2 : '', category3 : '' };

  if(walkin.status === 'Unresolved - No show') {
    subject += 'Unresolved - No show';

    obj.type = 'Incident';
    obj.category1 = 'Service Desk';
    obj.category2 = 'Internal Process';
    obj.category3 = 'Unsupported User';
  }
  else {
    if(walkin.status === 'Unresolved - Customer will return')
      subject += 'Unresolved - Customer will return: ';

    switch(walkin.resolutionType){
      case 'EmoryGuest':
        subject += 'EG ';
        if(walkin.deviceCategory === 'Other')
          subject += walkin.otherDevice;
        else if(dinfo) subject += dinfo;

        obj.type = 'Incident';
        obj.category1 = 'Student Technology';
        obj.category2 = 'Hardware';
        obj.category3 = 'Add';
        break;

      case 'EmoryUnplugged':
        subject += 'EU ';
        if(walkin.deviceCategory === 'Other')
          subject += walkin.otherDevice;
        else if(dinfo) {
          if(walkin.deviceCategory === 'Phone/Tablet')
            subject += 'Mobile ' + dinfo;
          else subject += dinfo;
        }

        obj.category1 = 'Student Technology';
        obj.category2 = 'OS/Firmware';
        obj.category3 = 'Modify';
        break;

      case 'Hardware':
        subject += 'HW';

        obj.category1 = 'Student Technology';
        obj.category2 = 'Hardware';
        obj.category3 = 'Failure';
        break;

      case 'Office365':
        subject += 'O365';

        obj.category1 = 'Application Management';
        obj.category2 = 'Access';
        obj.category3 = 'Error';
        break;

      case 'OS Troubleshooting':
        subject += 'OS TblSh ';

        if(walkin.deviceCategory === 'Other')
          subject += walkin.otherDevice;
        else if(dinfo) subject += dinfo;

        obj.category1 = 'Student Technology';
        obj.category2 = 'OS/Firmware';
        obj.category3 = 'Consult';
        break;

      case 'Password Resets':
        subject += 'PwdReset';

        obj.category1 = 'Security Management';
        obj.category2 = 'Password';
        obj.category3 = 'Reset';
        break;

      case 'Printing':
        subject += 'Printing';

        obj.category1 = 'Student Technology';
        obj.category2 = 'User Printing';
        obj.category3 = 'Consult';
        break;

      case 'Check-in':
        subject += 'Converted to CI';

        obj.category1 = 'Student Technology';
        obj.category2 = 'OS/Firmware';
        obj.category3 = 'Error';
        break;

      case 'Other':
        subject += 'Other ' + walkin.otherResolution;

        obj.category1 = 'Student Technology';
        obj.category2 = 'OS/Firmware';
        obj.category3 = 'Error';
        break;
    }
  }

  obj.short_description = subject;
  return obj;
};

var getCheckinTemplateObj = function(checkin){
  return {
    short_description: 'STS: CI: Diagnose and Repair',
    category1: 'Student Technology',
    category2: 'OS/Firmware',
    category3: 'Restore'
  };
};

var formulateWalkin = function(walkin, soapAction){
  var template = getWalkinTemplateObj(walkin);

  return {
    // Request info
    u_soap_action : soapAction,
    u_incident_state : 'Resolved',
    u_resolution_code : 'Solved',

    // Static info
    u_category_1 : template.category1,
    u_category_2 : template.category2,
    u_category_3 : template.category3,
    u_configuration_item : 'Student Technology',
    u_impact : '4 – Minor/Localized',
    u_suppress_notification : 'Yes',
    u_urgency : '4 - Low',

    // Walk-in info
    u_correlation_id : walkin._id,
    u_record_type:  (template.type)? template.type :'Incident',
    u_reported_source :  'Walk-in',
    u_customer : walkin.user.isWildcard? 'guest' : walkin.user.username,
    u_problem : 'Problem:\n' + getEscapedXMLCharacters(walkin.description),
    u_liability_agreement : walkin.liabilityAgreement,
    u_short_description : template.short_description,
    u_resolution : getEscapedXMLCharacters(walkin.resolution),
    u_work_note : walkin.workNote? getEscapedXMLCharacters(walkin.workNote) : '',

    // Assignment info
    u_assigned_to : walkin.serviceTechnician.username,
    u_last_update_tech : walkin.resoluteTechnician.username,
    u_assignment_group : 'LITS: Student Digital Life',

    // Time log
    u_duration : walkin.resolutionTime.getTime() - walkin.created.getTime(),
    u_time_worked : walkin.resolutionTime.getTime() - walkin.serviceStartTime.getTime(),
    u_last_update : walkin.updated.getTime(),
    u_actual_resolve_at : walkin.resolutionTime.getTime(),
    u_time_of_incident : walkin.created.getTime()
  };
};

var formulateCheckin = function(checkin, soapAction) {
  var worknote = '', template = getCheckinTemplateObj(checkin);
  worknote += 'Device : ' + checkin.deviceManufacturer + ' ' + checkin.deviceModel + '\n';
  worknote += 'OS : ' + checkin.walkin.deviceInfo + ' (' + checkin.deviceInfoOS.join(', ') + ')\n';
  worknote += 'Item received: ' + checkin.itemReceived.join(', ') + '\n\n';
  worknote += checkin.serviceLog.map(function(log){ return log.description; }).join('\n');

  if(!checkin.completionTime)
    checkin.completionTime = checkin.created.getTime() + (1000*60*60*24*4);

  return {
    // Request info
    u_soap_action : soapAction,
    u_incident_state : 'Resolved',
    u_resolution_code : 'Configure',

    // Static info
    u_category_1 : template.category1,
    u_category_2 : template.category2,
    u_category_3 : template.category3,
    u_configuration_item : 'Student Technology',
    u_impact : '4 – Minor/Localized',
    u_suppress_notification : 'Yes',
    u_urgency : '4 - Low',

    // Check-in info
    u_correlation_id : 'CI'+checkin._id,
    u_record_type:  (template.type)? template.type :'Incident',
    u_reported_source :  'Tech Initiated',
    u_customer : checkin.user.isWildcard? 'guest' : checkin.user.username,
    u_problem : getEscapedXMLCharacters(checkin.preDiagnostic),
    u_liability_agreement : checkin.liabilitySig !== '',
    u_short_description : template.short_description,
    u_resolution : 'Please see work notes for detailed description of resolution.',
    u_work_note : getEscapedXMLCharacters(worknote),

    // Assignment info
    u_assigned_to : checkin.walkin.resoluteTechnician.username,
    u_last_update_tech : checkin.completionTechnician.username,
    u_assignment_group : 'LITS: Student Digital Life',

    // Time log
    u_duration : checkin.completionTime.getTime() - checkin.created.getTime(),
    u_time_worked : checkin.completionTime.getTime() - checkin.created.getTime(),
    u_last_update : checkin.updated.getTime(),
    u_actual_resolve_at : checkin.completionTime.getTime(),
    u_time_of_incident : checkin.created.getTime()
  };
};

var formulateMessageForwarding = function(ticket, soapAction){
  return {
    u_soap_action: soapAction,
    u_correlation_id: ticket.snValue,
    u_time_of_incident: ticket.resolutionTime.getTime(),
    u_short_description: 'Unblock User\'s Account',
    u_customer: ticket.user.isWildcard? 'guest' : ticket.user.username,
    u_incident_state: 'Awaiting Assignment',
    u_record_type: 'Incident',
    u_reported_source: 'Tech Initiated',
    u_impact: '4 – Minor/Localized',
    u_configuration_item: 'Office 365',
    u_suppress_notification: 'No',
    u_urgency: '4 - Low',
    u_assignment_group: 'LITS: Messaging - Tier 3',
    u_category_1: 'Email &amp; Messaging',
    u_category_2: 'Mailbox',
    u_category_3: 'Restore',
    u_work_note: 'See ' + ticket.snValue + '\n1.Reset user\'s password\n2.Educated user on phishing\n3.Scanned machine for threats\n4.Enrolled user in Duo\n\nMessaging: Please remove block.'
  };
};

exports.CREATE = 'CREATE';	exports.UPDATE = 'UPDATE';
exports.WALKIN = 'WALKIN';	exports.CHECKIN = 'CHECKIN';

exports.syncIncident = function(action, type, ticket, next){
  var data;
  switch(type){
    case this.WALKIN: data = formulateWalkin(ticket, action); console.log('Syncing Walk-in ID: ' + ticket._id); break;
    case this.CHECKIN: data = formulateCheckin(ticket, action); console.log('Syncing Check-in ID: ' + ticket._id); break;
    default: return console.error('Invalid ticket type: ' + type);
  }

  soap.createClient(credential.wsdl_url, function(err, client){
    if(err) return console.error('Client Creation Error: ' + err);
    client.setSecurity(new soap.BasicAuthSecurity(credential.username, credential.password));

    client.insert(data, function(err, response){
      if(err) return console.error('Insert Request Error: ' + err);

      if(response.sys_id && response.display_value){
        switch(response.status){
          case 'inserted':
            ticket.snValue = response.display_value;

            ticket.save(function(err){
              if(err) return console.error(err);
              else{
                console.log('>> INFO: ' + type + ' ' + ticket.snValue + ' inserted.');
              }
            });
            break;
          case 'updated':
            if(!ticket.snValue)
              ticket.snValue = response.display_value;

            ticket.save(function(err){
              if(err) return console.error('Ticket Save Error: ' + err);
              else{
                console.log('>> INFO: ' + type + ' ' + ticket.snValue + ' updated.');
              }
            });
            break;
          default:
            console.error('Invalid Status Error:');
            return console.error(response);
        }
      }
      else{
        console.error('Field(s) Missing Error:');
        console.error(response);
      }

      if(next) return next(ticket);
      else return ticket;
    });
  });
};

exports.forwardIncident = function(action, type, ticket, next){
  var data;
  switch(type){
    case this.WALKIN: data = formulateMessageForwarding(ticket, action); break;
    default: return console.error('Invalid ticket type: ' + type);
  }

  soap.createClient(credential.wsdl_url, function(err, client){
    if(err) return console.error('Client Creation Error: ' + err);
    client.setSecurity(new soap.BasicAuthSecurity(credential.username, credential.password));

    client.insert(data, function(err, response){
      if(err) return console.error('Insert Request Error: ' + err);

      if(response.sys_id && response.display_value){
        switch(response.status){
          case 'inserted': case 'updated':
            ticket.forwardSnValue = response.display_value;

            ticket.save(function(err) {
              if (err) return console.error(err);
              else console.log('>> ' + ticket.snValue + ' Ticket forwarded: ' + response.display_value);
            });
            break;
          
          default:
            console.error('Invalid Status Error:');
            return console.error(response);
        }
      }
      else{
        console.error('Field(s) Missing Error:');
        console.error(response);
      }

      if(next) return next(ticket);
      else return ticket;
    });
  });
};

exports.syncTicketAux = function(client, id, action, type, tickets){
  if(id < tickets.length){
    var data, ticket = tickets[id];

    switch(type){
      case exports.WALKIN: data = formulateWalkin(ticket, action); console.log('Syncing Walk-in ID: ' + ticket._id + ' (scheduled)'); break;
      case exports.CHECKIN: data = formulateCheckin(ticket, action); console.log('Syncing Check-in ID: ' + ticket._id + ' (scheduled)'); break;
      default: return console.error('Invalid ticket type: ' + type);
    }

    if(ticket.user.verified) {
      client.insert(data, function(err, response){
        if(err) return console.error(err);

        else if(response.sys_id && response.display_value){
          switch(response.status){
            case 'inserted':
              ticket.snValue = response.display_value;
              ticket.save(function(err){
                if(err) return console.error(err);
                else{
                  console.log('INFO: ' + type + ' ' + ticket.snValue + ' inserted. (scheduled)');
                }
              });
              break;
            case 'updated':
              if(!ticket.snValue)
                ticket.snValue = response.display_value;

              ticket.save(function(err){
                if(err) return console.error(err);
                else{
                  console.log('INFO: '+ type + ' ' + ticket.snValue + ' updated. (scheduled)');
                }
              });
              break;
            default:
              console.error('Invalid Status Error:'); console.error(response);
          }
        }
        else{ console.error('Field(s) Missing Error:'); console.error(response); }
        exports.syncTicketAux(client, id+1, action, type, tickets);
      });
    }
    else {
      console.error('Sync aborted: User not verified');
      exports.syncTicketAux(client, id+1, action, type, tickets);
    }
  }
};

exports.syncUnsyncedTickets = function(action, type){
  var today = new Date(Date.now()); today.setHours(0);
  var query = { isActive : true, status : { $in : ['Completed', 'Unresolved', 'Unresolved - Customer will return',
    'Unresolved - Not eligible', 'Unresolved - No show'] }, snValue : '', created : { $gte: today } };

  console.log('Scheduler: Syncing unsynced ' + type + ' tickets');
  async.waterfall([
    function(callback){
      switch(type){
        case exports.WALKIN:
          Walkin.find(query).populate(popOpt_walkin).exec(function(err, walkins){
            if(err) callback(console.error(err));
            else return callback(null, walkins);
          });
          break;
        case exports.CHECKIN:
          Checkin.find(query).populate(popOpt_checkin).exec(function(err, checkins){
            if(err) callback(console.error(err));

            Walkin.populate(checkins, popOpt_checkin_walkin, function(err, checkins){
              if(err) callback(console.error(err));
              else return callback(null, checkins);
            });
          });
          break;
        default: callback(console.error('Invalid ticket type: ' + type), null);
      }
    },
    function(tickets, callback){
      soap.createClient(credential.wsdl_url, function(err, client){
        if(err) return console.error(err);
        client.setSecurity(new soap.BasicAuthSecurity(credential.username, credential.password));

        console.log('Syncing ' + tickets.length + ' ' + type + ' tickets...');
        if(tickets.length)
          exports.syncTicketAux(client, 0, action, type, tickets);
        callback(null);
      });
    }
  ]);
};

exports.createSoapClient = function(callback) {
  soap.createClient(credential.wsdl_url, function(err, client){
    if(err) return console.error(err);
    client.setSecurity(new soap.BasicAuthSecurity(credential.username, credential.password));
    callback(client);
  });
};
