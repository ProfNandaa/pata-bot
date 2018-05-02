/**
 * Conversations
 */
const validator = require('validator');

const postTut = (chat, start, url, title, callback) => {
  const askUrl = (convo, repeat) => {
    let text = `What's the tutorial url?`;
    if (repeat) text = `Please try again.`;

    let question = {
      text,
      quickReplies: [
        { content_type: 'text', title: 'cancel' },
      ],
    }
    
    convo.ask(question, (payload, convo) => {
      if (!payload.message || payload.message.text == 'cancel') {
        convo.say({
          text: `Cancelled`,
          quickReplies: [
            { content_type: 'text', title: 'View Tutorials' },
            { content_type: 'text', title: 'Post Tutorial', payload: 'tuts:post' }
          ],
        });
        return;
      }
      
      let url = '';
      if (payload.message) url = payload.message.text;
      if (!validator.isURL(url, { require_protocol: true })) {
        // loop recursively until a valid url is provided
        convo.say(`Oops, this doesn't look like a valid url. Please start with http(s).`)
          .then(() => askUrl(convo, true));
      } else {
        // end current convo and start fresh one
        convo.end();
        const title = payload.message.attachments ? 
          payload.message.attachments[0].title : 'No Title';
        postTut(chat, 'rating', url, title, callback);
      }
    });
  };

  const askRating = (convo, repeat) => {
    // save url sent
    convo.set('url', url);
    convo.set('title', title);

    let text = `How would you rate this tutorial?`;
    if (repeat) text = `Please try again.`;

    let question = {
      text,
      quickReplies: [
        { content_type: 'text', title: '1' },
        { content_type: 'text', title: '2' },
        { content_type: 'text', title: '3' },
        { content_type: 'text', title: '4' },
        { content_type: 'text', title: '5' },
      ],
    }
    
    convo.ask(question, (payload, convo) => {
      if (!payload.message || payload.message.text == 'cancel') {
        convo.end();
        convo.say({
          text: `Cancelled`,
          quickReplies: [
            { content_type: 'text', title: 'View Tutorials' },
            { content_type: 'text', title: 'Post Tutorial', payload: 'tuts:post' }
          ],
        });
        return;
      }
      
      let rating = 0;
      if (payload.message) rating = parseInt(payload.message.text);
      if (rating && [1, 2, 3, 4, 5].includes(rating)) {
        convo.set('rating', rating);
        askComment(convo);
      } else {
        // loop recursively until a valid url is provided
        convo.say(`Oops, the ratings can only be between 1 - 5`)
        .then(() => askRating(convo, true));
      }
    });
  };

  const askComment = (convo, repeat) => {
    let text = `Please leave a brief comment on why you prefer this tutorial?`;
    if (repeat) text = `Please try again.`;

    let question = {
      text,
      quickReplies: [
        { content_type: 'text', title: 'cancel' },
      ],
    }
    
    convo.ask(question, (payload, convo) => {
      if (!payload.message || payload.message.text == 'cancel') {
        convo.end();
        convo.say({
          text: `Cancelled`,
          quickReplies: [
            { content_type: 'text', title: 'View Tutorials' },
            { content_type: 'text', title: 'Post Tutorial', payload: 'tuts:post' }
          ],
        });
        return;
      }
      
      let comment = '';
      if (payload.message) comment = payload.message.text;
      if (comment !== '') {
        convo.set('comment', comment);
        end(convo);
      } else {
        // loop recursively until a valid url is provided
        convo.say(`Looks like your comment is empty`)
        .then(() => askComment(convo, true));
      }
    });
  };

  const end = (convo) => {
    convo.end();
    callback({
      title: convo.get('title'),
      url: convo.get('url'),
      rating: convo.get('rating'),
      comment: convo.get('comment'),
    });
  };

  // start convo
  chat.conversation((convo) => {
    if (start === 'rating') {
      askRating(convo);
    } else {
      askUrl(convo);
    }
  });
}

module.exports = {
  postTut,
};
