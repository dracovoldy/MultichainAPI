const router = require('express').Router();
const axios = require('axios').default;
const Joi = require('joi');

const wrap = require("../middleware/wrap");
const schemas = require("../schemas");
const mockDB = require("../mockdb");

const sURL = process.env.MULTICHAIN_API_URL;

const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.MULTICHAIN_API_KEY
}

/* Tracking Master Endpoint */
router.get('/masterPage', wrap(async (req, res) => {

    var response = await axios({
        method: 'post',
        url: sURL,
        data: {
            method: "liststreams",
            params: ["*"]
        },
        headers: headers
    });

    var json = response.data.result.
        filter(oData => {
            return oData.name.length === 13
        }).
        map(oData => {
            return {
                streamName: oData.name
            }
        });

    console.log(response.data);
    res.send({ result: json });

}));

/* Tracking Status */
router.get('/statusFlow', wrap(async (req, res) => {

    const { ebeln } = req.query;

}));


/* Tracking Detail page */
router.get('/detailPage', wrap(async (req, res, next) => {

    const { ebeln } = req.query;
    const streamName = 'PO_' + ebeln;

    var response = await axios({
        method: 'post',
        url: sURL,
        data: {
            method: "liststreamitems",
            params: [streamName, true, 100]
        },
        headers: headers
    });
    console.log(response.data);

    var json = response.data.result.map(oData => {
        return {
            status: oData.key,
            createdOn: oData.data.json.metadata.createdOn,
            deliveryDate: oData.data.json.data.lineitems[0].deliveryDate,
            vessel: oData.data.json.data.lineitems[0].vessel,
            supplier: oData.data.json.data.header.supplierNumber,
            startShipping: oData.data.json.metadata.startShipping,
            airWaybill: oData.data.json.metadata.airWaybill,
            dateCollectSupplier: oData.data.json.metadata.dateCollectSupplier,
            quantity: oData.data.json.data.lineitems.reduce((acc, curr) => acc + curr.quantity, 0)
        }
    });

    console.log(json);
    res.send({
        result: json,
        header: { ebeln: ebeln }
    });

}));

module.exports = router;