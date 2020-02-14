const router = require('express').Router();
const axios = require('axios').default;
const wrap = require("../middleware/wrap");
const schemas = require("../schemas");
const mockDB = require("../mockdb");
const Joi = require('joi');

const sURL = process.env.MULTICHAIN_API_URL;

const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.MULTICHAIN_API_KEY
}

/* create/write to stream */
router.post('/', wrap(async (req, res, next) => {

    const { metadata, data } = req.body;

    switch (metadata.action) {
        case 'POCREATE':
            // First validate req.body
            var { error } = Joi.validate(req.body, schemas.PoCreate, { abortEarly: false });
            var valid = error == null;

            if (!valid) {
                var { details } = error;
                var message = details.map(i => i.message).join(',');

                console.log("validation error", message);
                res.status(422).json({ error: message })
            } else {
                // Check DB if stream exists -> get streamId
                var streamName = "PO_" + data.header.poNumber;
                var matchedStream = mockDB.streams.find(o => o.streamName === streamName);

                // If no values in DB, create Stream
                if (matchedStream) {
                    throw new Error('StreamName exists')
                } else {
                    // Create Stream
                    var response1 = await axios({
                        method: 'post',
                        url: sURL,
                        data: {
                            method: "create",
                            params: ["stream", streamName, {}]
                        },
                        headers: headers
                    });
                    console.log(response1.data);

                    // Publish to Stream
                    var response2 = await axios({
                        method: 'post',
                        url: sURL,
                        data: {
                            method: "publish",
                            params: [streamName, "POCREATE", {
                                json: {
                                    metadata: {
                                        action: 'POCREATE',
                                        createdOn: new Date()
                                    },
                                    data:{
                                        header: data.header,
                                        lineitems: data.lineitems
                                    }
                                    
                                }
                            }]
                        },
                        headers: headers
                    });
                    console.log(response2.data);

                    res.send(response2.data);
                }
            }

            break;
        case 'ORDERCONFIRM':
            // First validate req.body
            var { error } = Joi.validate(req.body, schemas.OrderConfirm, { abortEarly: false });
            var valid = error == null;

            if (!valid) {
                var { details } = error;
                var message = details.map(i => i.message).join(',');

                console.log("validation error", message);
                res.status(422).json({ error: message })
            } else {
                // Check DB if stream exists -> get streamId
                var streamName = "PO_" + data.header.poNumber;
                var matchedStream = mockDB.streams.find(o => o.streamName === streamName);

                // If no values in DB, create Stream
                if (matchedStream) {                    

                    // Publish to Stream
                    var response = await axios({
                        method: 'post',
                        url: sURL,
                        data: {
                            method: "publish",
                            params: [streamName, "ORDERCONFIRM", {
                                json: {
                                    metadata: {
                                        action: 'ORDERCONFIRM',
                                        createdOn: new Date()
                                    },
                                    data:{
                                        header: data.header,
                                        lineitems: data.lineitems
                                    }
                                }
                            }]
                        },
                        headers: headers
                    });
                    console.log(response.data);

                    res.send(response.data);
                } else {
                    throw new Error('StreamName does not exist');
                }
            }
            break;
        case 'ASN':
            // First validate req.body
            var { error } = Joi.validate(req.body, schemas.AdvanceShippingNotification, { abortEarly: false });
            var valid = error == null;

            if (!valid) {
                var { details } = error;
                var message = details.map(i => i.message).join(',');

                console.log("validation error", message);
                res.status(422).json({ error: message })
            } else {
                // Check DB if stream exists -> get streamId
                var streamName = "PO_" + data.header.poNumber;
                var matchedStream = mockDB.streams.find(o => o.streamName === streamName);

                // If no values in DB, create Stream
                if (matchedStream) {                    

                    // Publish to Stream
                    var response = await axios({
                        method: 'post',
                        url: sURL,
                        data: {
                            method: "publish",
                            params: [streamName, "ASN", {
                                json: {
                                    metadata: {
                                        action: 'ASN',
                                        createdOn: new Date(),
                                        startShipping: metadata.startShipping,
                                        dateCollectSupplier: metadata.dateCollectSupplier,
                                        airWaybill: metadata.airWaybill
                                    },
                                    data:{
                                        header: data.header,
                                        lineitems: data.lineitems
                                    }
                                }
                            }]
                        },
                        headers: headers
                    });
                    console.log(response.data);

                    res.send(response.data);
                } else {
                    throw new Error('StreamName does not exist');
                }
            }
            break;
        default:
            res.status(422).json({ error: "invalid action" });
    }

}));

/* GET all POs (streams) */
router.get('/get', wrap(async (req, res) => {

    let { search } = req.query;

    if (!search) {

        var response = await axios({
            method: 'post',
            url: sURL,
            data: {
                method: "liststreams",
                params: ["*"]
            },
            headers: headers
        });

        console.log(response.data);
        res.send(response.data);

    } else {
        console.log("search else");
        throw new Error('Search Else')
        // TODO: query DB to get list of stream IDs
        // TODO: Maybe liststreams too
    }

}));


/* Get Stream Items by key */
router.get('/items', (req, res) => {

    // streamId -> name/createtxid/streamref ... "PO_<ebeln>"
    // itemType -> key
    let { streamId, itemType } = req.query;

    switch (itemType) {
        case 'POCREATE':
            // TODO: Get PO Creation
            axios({
                method: 'post',
                url: sURL,
                data: {
                    method: "liststreamkeyitems",
                    params: [streamId, "POCREATE"]
                },
                headers: headers
            })
                .then((response) => {
                    // console.log(response);
                    res.send(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    res.send(error);
                });
            break;
        case 'ORDERCONFIRM':
            // Get all Order Confirmations
            axios({
                method: 'post',
                url: sURL,
                data: {
                    method: "liststreamkeyitems",
                    params: [streamId, "ORDERCONFIRM"]
                },
                headers: headers
            })
                .then((response) => {
                    // console.log(response);
                    res.send(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    res.send(error);
                });
            break;
        case 'ASN':
            // Get Inbound Delivery Notifications
            axios({
                method: 'post',
                url: sURL,
                data: {
                    method: "liststreamkeyitems",
                    params: [streamId, "ASN"]
                },
                headers: headers
            })
                .then((response) => {
                    // console.log(response);
                    res.send(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    res.send(error);
                });
            break;
        default:
            // @method: liststreamitems, get all items in stream
            axios({
                method: 'post',
                url: sURL,
                data: {
                    method: "liststreamitems",
                    params: [streamId]
                },
                headers: headers
            })
                .then((response) => {
                    // console.log(response);
                    res.send(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    res.send(error);
                });
    }


});

module.exports = router;