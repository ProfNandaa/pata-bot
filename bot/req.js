const request = require('request');

let apiUrl = 'http://node.pata.group/api/';

if (process.env.NODE_ENV == 'development') {
  apiUrl = 'http://localhost:8000/';
}

const makeGetReq = (path, cb) => {
  const opts = {
    url: `${apiUrl}${path}`,
  };
  request.get(opts, (err, res) => {
    if (res && res.statusCode > 300 || err) {
      console.log('error:', res.statusCode, err);
    }
    cb(err, res);
  });
};

const makePostReq = (path, formData, cb) => {
  const opts = {
    url: `${apiUrl}${path}`,
    formData,
  };
  request.post(opts, (err, res) => {
    if (res && res.statusCode > 300 || err) {
      console.log('error:', res.statusCode, err);
    }
    cb(err, res);
  });
};

const makePutReq = (path, formData, cb) => {
  const opts = {
    url: `${apiUrl}${path}`,
    formData,
  };

  console.log('opts', opts);
  request.put(opts, (err, res) => {
    if (res && res.statusCode > 300 || err) {
      console.log('error:', res.statusCode, err);
    }
    cb(err, res);
  });
};


module.exports = {
  makeGetReq,
  makePostReq,
  makePutReq,
};
