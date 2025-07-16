const express = require("express");
const {
  getRequest,
  processError,
  postRequest,
  putRequest,
} = require("../helpers/helper");
const { postContactValidator } = require("../helpers/validator");
const router = express.Router();

const { SAGE_ACCOUNTING_API } = process.env;

router.post("/", postContactValidator, async (req, res, next) => {
  const contact = req.body;
  try {
    const url = `${SAGE_ACCOUNTING_API}/contacts`;
    const response = await postRequest(url, { contact });
    return res.status(201).json(response.data);
  } catch (error) {
    if (error.response?.data) {
      return next(processError(error));
    }
    return next(error);
  }
});

router.put("/:contactId", postContactValidator, async (req, res, next) => {
  const contactId = req.params.contactId;
  const contact = req.body;

  try {
    const url = `${SAGE_ACCOUNTING_API}/contacts/${contactId}`;
    const response = await putRequest(url, { contact });
    return res.status(201).json(response.data);
  } catch (error) {
    if (error.response?.data) {
      return next(processError(error));
    }
    return next(error);
  }
});

router.get("/search", async (req, res, next) => {
  const { page, items_per_page, search } = req.query;
  const currentPage = page ?? 1;
  const itemPerPage = items_per_page ?? 200;

  try {
    const url = `${SAGE_ACCOUNTING_API}/contacts?page=${currentPage}&items_per_page=${itemPerPage}&search=${search}`;
    const response = await getRequest(url);
    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response?.data) {
      return next(processError(error));
    }
    return next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;

  try {
    const url = `${SAGE_ACCOUNTING_API}/contacts/${contactId}`;
    const response = await getRequest(url);
    return res.json(response.data);
  } catch (error) {
    if (error.response?.data) {
      return next(processError(error));
    }
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  const { page, items_per_page } = req.query;
  const currentPage = page ?? 1;
  const itemPerPage = items_per_page ?? 200;

  try {
    const url = `${SAGE_ACCOUNTING_API}/contacts?page=${currentPage}&items_per_page=${itemPerPage}`;
    const response = await getRequest(url);
    return res.json(response.data);
  } catch (error) {
    if (error.response?.data) {
      return next(processError(error));
    }
    return next(error);
  }
});

module.exports = router;
