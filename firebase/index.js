const firebase = require('./init');

const env = process.env.NODE_ENV || 'development';

let usersRef = `/${env}/logs/users/`;

const timestamp = () => {
  // return current_timestamp
  return Math.round((new Date()).getTime());
}

const logUserActivity = (psid, activity) => {
  // activity => { type, details }
  const logRef = firebase.database().ref(`${usersRef}${psid}/${timestamp()}`);
  logRef.set(activity);
};

const saveAttachment = (psid, attachment) => {
  const attRef = firebase.database().ref(`${usersRef}attachments/${psid}/${timestamp()}`);
  attRef.set(attachment);
}

const saveUser = (psid, user, update=false) => {
  const userProfileRef = firebase.database().ref(`${usersRef}${psid}/profile`);
  if (update) {
    userProfileRef.update(user);
  } else {
    userProfileRef.set(user);
  }
};

module.exports = {
  logUserActivity,
  saveAttachment,
  saveUser,
};
