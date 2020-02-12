const Joi = require('joi');


const schemas = {
    // Define all schemas
    POCREATEbody: Joi.object().keys({
        mode: Joi.string().valid('POCREATE').required(),
        header: Joi.object().keys({
            ebeln: Joi.string().length(10).required(),
            lifnr: Joi.string().length(10).required()
        }),
        lineitems: Joi.array().items(
            Joi.object().keys({
                ebelp: Joi.string().length(5).required(),
                menge: Joi.number().precision(3).required(),
                werks: Joi.string().length(4).required()
            })
        )
    }),
    ORDERCONFIRMbody: Joi.object().keys({
        mode: Joi.string().valid('ORDERCONFIRM').required(),
        header: Joi.object().keys({
            ebeln: Joi.string().length(10).required(),
            lifnr: Joi.string().length(10).required()
        }),
        lineitems: Joi.array().items(
            Joi.object().keys({
                ebelp: Joi.string().length(5).required(),
                menge: Joi.number().precision(3).required(),
                werks: Joi.string().length(4).required(),
                eindt: Joi.string().length(8).required()
            })
        )
    })
};
module.exports = schemas;