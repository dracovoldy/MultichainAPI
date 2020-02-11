const router = require('express').Router();

router.get('/', (req, res) => {
    res.send("Hello MultiChain");
});

module.exports = router;