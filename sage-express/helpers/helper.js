const axios = require("axios");
const mysql = require("mysql2");

function getRedirectUrl() {
  const { APP_URL, SAGE_AUTH_REDIRECT_PATH } = process.env;
  return `${APP_URL}/${SAGE_AUTH_REDIRECT_PATH}`;
}

async function getRequest(url) {
  const record = await getDbToken();
  const headers = {
    "Content-Type": "application/json", // "application/x-www-form-urlencoded",
    Accept: "application/json",
    Authorization: `Bearer ${record.accessToken}`,
  };
  const response = await axios.get(url, { headers });
  return response;
}

async function postRequest(url, body) {
  const { SAGE_TOKEN_API } = process.env;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (url != SAGE_TOKEN_API) {
    const record = await getDbToken();
    headers.Authorization = `Bearer ${record.accessToken}`;
  }
  const response = await axios.post(url, body, {
    headers,
  });

  if (url == SAGE_TOKEN_API && response.data?.access_token) {
    let refreshToken;
    try {
      const {
        access_token,
        refresh_token,
        expires_in,
        refresh_token_expires_in,
      } = response.data;
      refreshToken = refresh_token;
      const accessDate = new Date();
      const refreshDate = new Date();
      accessDate.setHours(accessDate.getHours() + 2); // Adjust for Time difference
      refreshDate.setHours(refreshDate.getHours() + 2); // Adjust for Time difference
      accessDate.setMinutes(accessDate.getMinutes() + expires_in / 60);
      refreshDate.setMinutes(
        refreshDate.getMinutes() + refresh_token_expires_in / 60
      );
      const accessTokenExpired = accessDate
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
      const refreshTokenExpires = refreshDate
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

      await updateDbAccessToken(
        access_token,
        refresh_token,
        accessTokenExpired,
        refreshTokenExpires
      );
    } catch (error) {
      console.log({ refreshToken });
      throw error;
    }
  }
  return response;
}

async function putRequest(url, body) {
  const record = await getDbToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${record.accessToken}`,
  };

  const response = await axios.put(url, body, {
    headers,
  });

  return response;
}

function processError(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  if (!data) {
    return error;
  }

  // console.log("keys", Object.keys(error));
  // console.log("code", error.code);
  // console.log("message", error.message);
  // console.log("response", error.response);
  // console.log("data", error.response.data);
  const errorMessage = error.message;
  const statusText = error.response.statusText;
  const errorResponseMsg = error.response.data[0]?.$message;
  const errorDetails = `StatusText: ${statusText} <br /> Description: ${errorResponseMsg} <br /> ${errorMessage} `;
  const newError = new Error(errorDetails);
  newError.status = status;
  return newError;
}

function getDbConnection() {
  const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
  const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  });
  connection.connect();
  return connection;
}

async function updateDbAccessToken(
  accessToken,
  refreshToken,
  accessTokenExpires,
  refreshTokenExpires
) {
  const { TOKEN_TABLE } = process.env;
  const record = await getDbToken();
  return new Promise((resolve, reject) => {
    const connection = getDbConnection();
    const query = `UPDATE ${TOKEN_TABLE} SET accessToken="${accessToken}", refreshToken="${refreshToken}", accessTokenExpires="${accessTokenExpires}", refreshTokenExpires="${refreshTokenExpires}" WHERE id = ${record.id}`;
    connection.query(query, (err, result, fields) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

async function getDbToken() {
  const { TOKEN_TABLE } = process.env;

  return new Promise((resolve, reject) => {
    const connection = getDbConnection();
    const query = `SELECT * FROM  ${TOKEN_TABLE}  LIMIT 1;`;
    connection.query(query, (err, result, fields) => {
      if (err) {
        return reject(err);
      }
      return resolve(result[0]);
    });
  });
}

module.exports = {
  getRedirectUrl,
  getRequest,
  postRequest,
  putRequest,
  processError,
  getDbToken,
};
