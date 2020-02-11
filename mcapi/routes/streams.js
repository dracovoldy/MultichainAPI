const router = require('express').Router();
const axios = require('axios').default;
const wrap = require("../middleware/wrap");

const sURL = process.env.MULTICHAIN_API_URL;

const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.MULTICHAIN_API_KEY
}

const mockDB = {
    streams: [
        { streamName: "root", ebeln: "TEST", steamref: "0-0-0" },
        { streamName: "PO_700000011", ebeln: "700000011", steamref: "173-267-57259" },
        { streamName: "PO_70000001", ebeln: "70000001", steamref: "115-265-48018" }
    ]
}


/* create/write to stream */
router.post('/', wrap(async (req, res, next) => {

    const { ebeln, mode, header, items } = req.body;
    const streamName = "PO_" + ebeln;

    switch (mode) {
        case 'CREATEPO':
            // Check DB if stream exists -> get streamId
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
                        params: [streamName, "POCREATED", {
                            json: { header: header, items: items }
                        }]
                    },
                    headers: headers
                });
                console.log(response2.data);

                res.send(response2.data);
            }
            break;
        case 'ORDERCONFIRM':
            // Check DB if stream exists -> get streamId
            var matchedStream = mockDB.streams.find(o => o.streamName === streamName);

            // If Stream found, publish to stream
            if (matchedStream) {
                // Publish to Stream
                var response = await axios({
                    method: 'post',
                    url: sURL,
                    data: {
                        method: "publish",
                        params: [matchedStream.streamName, "ORDERCONFIRM", {
                            json: { header: header, items: items }
                        }]
                    },
                    headers: headers
                });
                console.log(response.data);

                res.send(response.data);
            } else {
                throw new Error('Stream not found')
            }
            break;
        case 'ASN':
            break;
        default:

    }

}));

/* GET all POs (streams) */
router.get('/', wrap(async (req, res) => {

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
        case 'POCREATED':
            // TODO: Get PO Creation
            axios({
                method: 'post',
                url: sURL,
                data: {
                    method: "liststreamkeyitems",
                    params: [streamId, "POCREATED"]
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
                    params: [streamId, "ASNSENT"]
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