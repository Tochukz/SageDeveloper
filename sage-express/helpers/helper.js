const axios = require("axios");

function getRedirectUrl() {
  const { APP_URL, SAGE_AUTH_REDIRECT_PATH } = process.env;
  return `${APP_URL}/${SAGE_AUTH_REDIRECT_PATH}`;
}

async function postRequest(body) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  return axios.post("https://oauth.accounting.sage.com/token", body, {
    headers,
  });
}

function processError(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  if (!data) {
    return error;
  }
  const { error: err, error_description } = data;
  const errMsg = `Erorr: ${err} /n Description: ${error_description}`;
  const newError = new Error(errMsg);
  newError.status = status;
  return newError;
}

module.exports = {
  getRedirectUrl,
  postRequest,
  processError,
};
