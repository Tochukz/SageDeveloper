const axios = require("axios");
const mysql = require("mysql2");

function getRedirectUrl() {
  const { APP_URL, SAGE_AUTH_REDIRECT_PATH } = process.env;
  return `${APP_URL}/${SAGE_AUTH_REDIRECT_PATH}`;
}

async function postRequest(body) {
  const { TOKEN_TABLE } = process.env;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  const response = await axios.post(
    "https://oauth.accounting.sage.com/token",
    body,
    {
      headers,
    }
  );

  if (TOKEN_TABLE && response.data?.access_token) {
    const { access_token, refresh_token } = response.data;
    updateDbAccessToken(access_token, refresh_token);
  }
  return response;
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

function updateDbAccessToken(accessToken, refreshToken) {
  const { DB_HOST, DB_USER, DB_PASS, DB_NAME, TOKEN_TABLE } = process.env;
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
    });
    connection.connect();
    const query = `UPDATE ${TOKEN_TABLE} SET accessToken="${accessToken}", refreshToken="${refreshToken}" WHERE id = 1`;
    connection.query(query, (err, result, fields) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

module.exports = {
  getRedirectUrl,
  postRequest,
  processError,
};
