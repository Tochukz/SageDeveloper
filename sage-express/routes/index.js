const express = require("express");
const randomstring = require("randomstring");
const {
  getRedirectUrl,
  postRequest,
  processError,
} = require("../helpers/helper");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/sage-express", (req, res, next) => {
  res.render("sage-express", {});
});

router.get("/request-sage-access", (req, res, next) => {
  const { SAGE_CLIENT_ID } = process.env;
  const { scope, country, language } = req.query;
  // Random string  to protect against CSRF attacks.
  // This value can be checked when returned from the sage auth server
  const state = randomstring.generate(16);
  const redirectUrl = getRedirectUrl();
  const url = `https://www.sageone.com/oauth2/auth/central?filter=apiv3.1&response_type=code&client_id=${SAGE_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scope}&state=random_string&country=${country}&language=${language}&state=${state}`;
  return res.redirect(url);
});

router.get("/sage-auth-callback", async (req, res, next) => {
  const { SAGE_CLIENT_ID, SAGE_CLIENT_SECRET } = process.env;
  const body = {
    client_id: SAGE_CLIENT_ID,
    client_secret: SAGE_CLIENT_SECRET,
    code: req.query.code,
    grant_type: "authorization_code",
    redirect_uri: getRedirectUrl(),
  };
  try {
    const response = await postRequest(body);
    /** Save the refresh_token, scope and requested_by_id to the user's record in your database  */
    return res.json(response.data);
  } catch (error) {
    if (error.response?.data) {
      return next(processError(error));
    }
    return next(error);
  }
});

router.post("/sage-refresh-token", async (req, res, next) => {
  const { SAGE_CLIENT_ID, SAGE_CLIENT_SECRET } = process.env;
  /**The refresh token should be obtained from database table for the current user */
  const refresh_token = req.body.refresh_token;
  const body = {
    client_id: SAGE_CLIENT_ID,
    client_secret: SAGE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  };
  try {
    const response = await postRequest(body);
    return res.json(response.data);
  } catch (error) {
    if (error.response?.data) {
      return next(processError(error));
    }
    return next(error);
  }
});

module.exports = router;

/*
Sample access token response from 
{
  "access_token": "eyJhbGciUxxxxxx",
  "scope": "full_access",
  "token_type": "bearer",
  "expires_in": 300,
  "refresh_token": "eyJhbGcixxxxxx",
  "refresh_token_expires_in": 2678400, // 4
  "requested_by_id": "xxxx-xxxx-xxxx-xxxx-xxxxxxx"
}

300 Seconds = 5 Minutes
2678400 Seconds = 31 Days
*/
