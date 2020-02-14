const Joi = require('joi');

const schemas = {
    // Define all schemas
    PoCreate: Joi.object().keys({
        metadata: Joi.object().keys({
            action: Joi.string().valid('POCREATE').required()
        }),
        data: Joi.object().keys({
            header: Joi.object().keys({
                poNumber: Joi.string().length(10).required(),
                supplierNumber: Joi.string().length(10).required()
            }),
            lineitems: Joi.array().items(
                Joi.object().keys({
                    itemNumber: Joi.string().length(5).required(),
                    quantity: Joi.number().precision(3).required(),
                    vessel: Joi.string().length(4).required()
                })
            )
        })
    }),
    OrderConfirm: Joi.object().keys({
        metadata: Joi.object().keys({
            action: Joi.string().valid('ORDERCONFIRM').required()
        }),
        data: Joi.object().keys({
            header: Joi.object().keys({
                poNumber: Joi.string().length(10).required(),
                supplierNumber: Joi.string().length(10).required()
            }),
            lineitems: Joi.array().items(
                Joi.object().keys({
                    itemNumber: Joi.string().length(5).required(),
                    quantity: Joi.number().precision(3).required(),
                    vessel: Joi.string().length(4).required(),
                    deliveryDate: Joi.string().length(8).required()
                })
            )
        })
    }),
    AdvanceShippingNotification: Joi.object().keys({
        metadata: Joi.object().keys({
            action: Joi.string().valid('ASN').required(),
            startShipping: Joi.boolean().required(),
            dateCollectSupplier: Joi.string().length(8).required(),
            airWaybill: Joi.string().required()

        }),
        data: Joi.object().keys({
            header: Joi.object().keys({
                poNumber: Joi.string().length(10).required(),
                supplierNumber: Joi.string().length(10).required()
            }),
            lineitems: Joi.array().items(
                Joi.object().keys({
                    itemNumber: Joi.string().length(5).required(),
                    quantity: Joi.number().precision(3).required(),
                    vessel: Joi.string().length(4).required()
                })
            )
        })
    })
       
};
module.exports = schemas;