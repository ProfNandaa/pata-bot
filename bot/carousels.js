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

const getGroupElems = (groups) => {
  const elems = [];
  groups.forEach((group) => {
    let elem = {
      title: group.name,
      image_url: group.url,
      subtitle: group.location ? ` In ${group.location}` : ' Unspecified Location',
      buttons: [
        {
          type: 'postback',
          title: 'View',
          payload: `viewGroup:${group.id}`,
        },
        {
          type: 'postback',
          title: 'Follow',
          payload: `follow:${group.id}`,
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
  });
}

// list top groups based on ratings
// and other heauristics later on (recommended groups)
const groups = (payload, chat) => {
  req.makeGetReq('group?popular=true', (err, res) => {
    let errReply = false;
    if (err) {
      console.log('err:', err);
      errReply = true;
    } else {
      let cats = JSON.parse(res.body);
      if (utils.validArray(cats)) {
        let elems = getGroupElems(cats);
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
const recs = (payload, chat, groupId) => {
  req.makeGetReq(`rec?group_id=${groupId}`, (err, res) => {
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
  groups,
  categoryTuts,
  tutsFind,
  recs,
};
