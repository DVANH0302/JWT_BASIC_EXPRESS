const express = require('express');
const router = express.Router();

// middlware
const {authenticateToken} = require("../middleware/auth");

const {login, dashboard, refresh} = require("../controllers/main");

router.route('/dashboard').get(authenticateToken, dashboard);
router.route('/login').post(login);
router.route('/refresh').get(refresh);

module.exports = router;