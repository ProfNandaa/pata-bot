/**
 * Replies
 */
const validator = require('validator');

const firebase = require('../firebase');
const req = require('./req');

// start
const start = (payload, chat, regex) => {
  // later, need to be intelligent not to greet twice
  // message should also be dynamic depending on day/time and language
  const greetings = ['Bonjour', 'Hi', 'Hello', 'Jambo', 'Hola', 'Olá', 'Ciao'];
  const index = Math.floor(Math.random() * (greetings.length - 1));

  chat.getUserProfile().then((user) => {
    chat.say({
      text: `${greetings[index]}, ${user.first_name}, let's get started :)`,
      quickReplies: [
        { content_type: 'text', title: 'View Groups' },
        { content_type: 'text', title: 'Take a Tour', payload: 'tour:0' },
      ]
    });

    // store preliminary user in DB
    const userObj = user;
    userObj.psid = user.id;
    delete user.id;

    req.makePostReq('auth?bot=true', userObj, (err, res) => {
      if (err) {
        console.log('user soft-registration: ', err);
      }
    });

    // save user in Firebase
    firebase.saveUser(payload.sender.id, user);
    // save in API db too
    req.makePostReq('user', user, (res) => {
      console.log(res);
    });
  });
}

// turning this off for now since
// it slows down the bot on production
const all = (payload, chat, regex) => {
  if (regex === 'all') {
    const message = payload.message.text;
    const whitelisted = [
      'Take a Tour',
      'Next',
      'Ok, let\'s go!',
      'Add a Group',
    ];
    if (whitelisted.includes(message)) return;
    if (validator.isURL(message) || validator.isNumeric(message)) return;
    const exclude = chat.bot._hearMap
      .map(o => o.keyword);
    exclude.pop();
    for (let i = 0; i < exclude.length; i += 1) {
      if (message.match(exclude[i])) return;
    };


    chat.say({
      text: `For now, I only respond to limited messages, sorry :(`,
      quickReplies: [
        { content_type: 'text', title: 'View Groups' },
        { content_type: 'text', title: 'Take a Tour', payload: 'tour:0' },
      ]
    });
  }
}

module.exports = {
  start,
  all,
};
