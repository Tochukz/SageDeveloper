require("dotenv").config();
const { postRequest, getDbToken, processError } = require("../helpers/helper");
const { SAGE_CLIENT_ID, SAGE_CLIENT_SECRET, SAGE_TOKEN_API } = process.env;

async function refreshToken() {
  const record = await getDbToken();
  const refresh_token = record.refreshToken;
  const body = {
    client_id: SAGE_CLIENT_ID,
    client_secret: SAGE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  };
  try {
    const url = SAGE_TOKEN_API;
    const response = await postRequest(url, body);
    // console.log("Response Data", response.data);
    console.log("Time: ", new Date().toGMTString());
    return response.data;
  } catch (error) {
    const errorDetails = processError(error);
    console.log("errorDetails", errorDetails);
  }
}

const time = 1000 * 60 * 4; // 4 Minutes
setInterval(async () => {
  await refreshToken();
}, time);

// refreshToken()
//   .then((res) => {
//     console.log("res", res);
//   })
//   .catch((err) => console.log("err", err));
