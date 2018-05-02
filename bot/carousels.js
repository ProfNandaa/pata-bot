/**
 * Carousels for various vategories
 */
const moment = require('moment');

const req = require('./req');

// common functions
const utils = {
  validArray(data) {
    return Array.isArray(data) && data.length > 0;
  },
};

const getCategoryElems = (cats) => {
  const elems = [];
  cats.forEach((cat) => {
    let elem = {
      title: cat.name,
      // image_url: 'http://lorempixel.com/200/120/abstract/',
      subtitle: `${cat.count} tutorials`,
      buttons: [
        {
          type: 'postback',
          title: 'View',
          payload: `categoryTuts:${cat.name}`,
        },
        {
          type: 'postback',
          title: 'Follow',
          payload: `follow:${cat.id}`,
        },
      ],
    };
    elems.push(elem);
  });
  return elems;
};

const getTutsElems = (cats) => {
  const elems = [];
  cats.forEach((tut) => {
    let extra = '';
    if (tut.tags.length > 0) {
      extra = `\n☌ tags: ${tut.tags.join(', ')}`;
    }

    let elem = {
      title: tut.title,
      subtitle: `Posted by ${tut.posted_by.name.split(' ')[0]}, ${moment(tut.date_posted).fromNow()}${extra}`,
      buttons: [
        {
          type: 'web_url',
          title: 'View',
          url: tut.url,
        },
        {
          type: 'postback',
          title: '★ See Reviews',
          payload: `recs:${tut.id}`,
        },
        {
          type: 'postback',
          title: '♥ Recommend',
          payload: `rec:${tut.id}`,
        },
        // {
        //   type: 'postback',
        //   title: '★ Bookmark',
        //   payload: `bookmark:${tut.id}`,
        // },
      ],
    };
    elems.push(elem);
  });
  return elems;
};

const categoryTuts = (payload, chat, tag) => {
  req.makeGetReq(`tut?tag=${tag}`, (err, res) => {
    let errReply = false;
    if (err) {
      console.log('err:', err);
      errReply = true;
    } else {
      let tuts = JSON.parse(res.body);
      if (utils.validArray(tuts)) {
        let elems = getTutsElems(tuts);
        chat.sendGenericTemplate(elems);
      } else {
        errReply = true;
      }
    }

    if (errReply) {
      chat.say(`Something went wrong, we'll get back.`);
    }
  })
}

// tutorial categories / tags
const categories = (payload, chat) => {
  req.makeGetReq('tag?popular=true', (err, res) => {
    let errReply = false;
    if (err) {
      console.log('err:', err);
      errReply = true;
    } else {
      let cats = JSON.parse(res.body);
      if (utils.validArray(cats)) {
        let elems = getCategoryElems(cats);
        chat.sendGenericTemplate(elems);
      } else {
        errReply = true;
      }
    }

    if (errReply) {
      chat.say(`Something went wrong, we'll get back.`);
    }
  });
};

const tutsFind = (payload, chat) => {
  // for now, we only support one search term
  const q = payload.message.text.split(' ')[1];

  req.makeGetReq(`tut?q=${q}`, (err, res) => {
    let errReply = false;
    if (err) {
      console.log('err:', err);
      errReply = true;
    } else {
      let tuts = JSON.parse(res.body);
      if (utils.validArray(tuts)) {
        let elems = getTutsElems(tuts);
        chat.sendGenericTemplate(elems);
      } else {
        chat.say(`No results were found for "${q}"`);
      }
    }

    if (errReply) {
      chat.say(`Something went wrong, we'll get back.`);
    }
  });
}

const getRecElems = (recs) => {
  const elems = [];
  recs.forEach((rec) => {
    let stars = '';
    for (let i = 0; i < rec.rating; i += 1) {
      stars += '☆ ';
    }
    let elem = {
      title: `${rec.posted_by.name} / ${stars.trim()}`,
      subtitle: `${rec.comment}`,
    };
    elems.push(elem);
  });
  return elems;
};

/**
 * List of recommendations
 * @param {object} payload
 * @param {object} chat
 */
const recs = (payload, chat, tutId) => {
  req.makeGetReq(`rec?tut_id=${tutId}`, (err, res) => {
    let errReply = false;
    if (err) {
      console.log('err:', err);
      errReply = true;
    } else {
      let recList = JSON.parse(res.body);
      if (utils.validArray(recList)) {
        let elems = getRecElems(recList);
        chat.sendGenericTemplate(elems);
      } else {
        errReply = true;
      }
    }

    if (errReply) {
      chat.say(`Something went wrong, we'll get back.`);
    }
  });
}

module.exports = {
  categories,
  categoryTuts,
  tutsFind,
  recs,
};
