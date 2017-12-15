"use strict";

const jsf = require('json-schema-faker');
const faker = require('faker');

module.exports = RED => {

    function Init(config) {

        RED.nodes.createNode(this, config);

        const node = this;
        node.field = config.field || "payload";
        node.fieldType = config.fieldType || "msg";
        node.lang = config.lang || "en";
        node.on('input', msg => {
            try {

                jsf.extend('faker', () => {
                    faker.locale = config.lang;
                    return faker;
                });

                let value = msg.payload;

                if (typeof value === 'string') {
                    value = JSON.parse(value);
                }

                value = jsf(value);

                switch (node.fieldType) {
                    case 'flow': {
                        node.context().flow.set(node.field, value);
                        break;
                    }
                    case 'global': {
                        node.context().global.set(node.field, value);
                        break;
                    }
                    default:
                    case 'msg': {
                        RED.util.setMessageProperty(msg, node.field, value);
                        break;
                    }
                }

                node.send(msg);

            } catch(err) {
                node.error(err.message);
            }
        });
    }
    RED.nodes.registerType("jsf", Init);
};
