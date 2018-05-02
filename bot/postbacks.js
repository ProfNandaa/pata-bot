/**
 * All postbacks are handled here
 */
const cr = require('./carousels');
const convos = require('./conversations');
const firebase = require('../firebase');
const replies = require('./replies');
const req = require('./req');

// tuts
const tuts = (payload, chat, start, url, title) => {
  convos.postTut(chat, start, url, title, (tut) => {
    tut.excerpt = '-'; // as placeholder for now
    req.makePostReq(`tut?fb_id=${payload.sender.id}`, tut, (err, res) => {
      if (!err) chat.say(`Tutorial posted, thanks!`);
      else console.error(err);
    });
  });
}

/**
 * List tuts for a particular category
 * @param {object} payload 
 * @param {object} chat 
 * @param {string} cat 
 */
const categoryTuts = (payload, chat, tag) => {
  cr.categoryTuts(payload, chat, tag);
}

const recs = (payload, chat, tutId) => {
  cr.recs(payload, chat, tutId);
}

const menu = (payload, chat, id) => {
  if (id == 'categories') {
    cr.categories(payload, chat);
  } else {
    chat.say(`Snap! Something went wrong :(`);
  }
};

// tour
const tour = (payload, chat, step) => {
  const reply = (text, next) => {
    chat.say({
        text,
        quickReplies: [
          { content_type: 'text', title: 'Next', payload: `tour:${next}` },
        ]
      });
  }
  let text = '';
  if (step == '0') {
    text = `Glad to take you through a 3 step tour. I'll walk you through some of the stuff I can do, though I'm not super smart :)`;
    reply(text, 1);
  } else if (step == '1') {
    text = `You can ask me about groups around you or based on your interests`;
    reply(text, 2);
  } else if (step == '2') {
    text = `You can browse through a list of our recommended groups based on your interests and locations`;
    reply(text, 3);
  } else if (step == '3') {
    text = `You can search for a group using only one keyword by texting "find <key-word>". That's all :)`;
    chat.say({
      text,
      quickReplies: [
        { content_type: 'text', title: 'Ok, let\'s go!', payload: 'menu:categories' },
        { content_type: 'text', title: 'Add a Group', payload: 'tuts:post' },
      ],
    });
  }
};

/**
 * Recommend tutorial from carousel
 * @param {object} payload 
 * @param {object} chat 
 * @param {int} id 
 */
const rec = (payload, chat, id) => {
  convos.postTut(chat, 'rating', id, '', (tut) => {
    const data = {
      tut_id: id,
      rating: tut.rating,
      comment: tut.comment,
    };
    req.makePostReq(`rec?fb_id=${payload.sender.id}`, data, (err, res) => {
      if (!err) chat.say(`Recommendation posted, thanks!`);
      else console.error(err);
    });
  });
}

const follow = (payload, chat, id) => {
  req.makePostReq(
    `tag/${id}/follow`,
    { fb_id: payload.sender.id },
    (err, res) => {
      if (!err) chat.say(`Followed`);
      else console.error(err);
    }
  );
};

const bookmark = (payload, chat, id) => {
  req.makePostReq(
    `tut/${id}/bookmark`,
    { fb_id: payload.sender.id },
    (err, res) => {
      if (!err) chat.say(`Bookmarked`);
      else console.error(err);
    }
  );
};

module.exports = {
  start: replies.start,
  tour,
  tuts,
  menu,
  categoryTuts,
  rec,
  recs,
  follow,
  bookmark,
};
