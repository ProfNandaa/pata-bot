const BootBot = require('bootbot');
const createLogger = require('bunyan').createLogger;

const isURL = require('validator/lib/isURL');

const cr = require('./carousels');
const firebase = require('../firebase');
const postbacks = require('./postbacks');
const replies = require('./replies');

const log = createLogger({
  name: 'bot',
  stream: process.stdout,
  level: 'info',
});

const bot = new BootBot({
  accessToken: process.env.PAGE_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
});

bot.on('error', (err) => {
  log.error(err.message);
});

bot.on('message', (payload, chat) => {
  const ctx = {
    sender: payload.sender.id,
    message: payload.message.text,
  };
  log.child(ctx).info('message');

  // channel quick_reply payload
  if (payload.message.quick_reply) {
    // synonimous to postback
    let postback = payload.message.quick_reply.payload.split(':');

    if (postbacks[postback[0]]) {
      postbacks[postback[0]](payload, chat, postback[1]);
    }
  }
  // hijack any posted link
  // if (isURL(payload.message.text, { require_protocol: true })) {
  //   const url = payload.message.text;
  //   const title = payload.message.attachments ? 
  //     payload.message.attachments[0].title : 'No Title';
  //   postbacks.group(payload, chat, 'rating', url, title);
  // }

  // log to Firebase
  firebase.logUserActivity(payload.sender.id, {
    type: 'message',
    payload,
  });
});

bot.hear([
  /hi[ ]*\.*/i,
  /hello[ ]*\.*/i,
  /hey[ ]*\.*/i,
  /get started/i,
  /help/i
  ],
  replies.start
);

// list categories
bot.hear([/view groups/i, /groups/i], cr.groups);
bot.hear([/add group/i, /add a group/i], postbacks.group);

// find tutorial
bot.hear([/^find/i], cr.tutsFind);

// list all trending artwork
bot.hear([/trending/i], cr.groups);

// bot.hear(/.*/, (payload, chat) => {
//   replies.all(payload, chat, 'all');
// });

// attachment sending
bot.on('attachment', (payload, chat) => {
  chat.say(`I see you've sent me some ${payload.message.attachments[0].type}, I'll process and get back to you later.`);
  firebase.saveAttachment(payload.sender.id, payload.message.attachments);
});

bot.on('postback', (payload, chat) => {
  let postback = payload.postback.payload.split(':');
  if (postbacks[postback[0]]) {
    postbacks[postback[0]](payload, chat, postback[1]);
  } else {
    chat.say('Coming soon :)');
  }

  // log to Firebase
  firebase.logUserActivity(payload.sender.id, {
    type: 'postback',
    payload,
  });
});

bot.setGetStartedButton("start");

bot.setPersistentMenu([
  {
    type: 'postback',
    title: 'Take Tour',
    payload: 'tour:0',
  },
  {
    type: 'postback',
    title: 'Top Groups',
    payload: 'menu:groups',
  },
  {
    type: 'postback',
    title: 'Add Group',
    payload: 'menu:profile',
  }
]);

module.exports = bot;
