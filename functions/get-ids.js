const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    if (event.queryStringParameters.pw !== "yudai2011") {
        return { statusCode: 403, headers, body: JSON.stringify({ error: "Forbidden" }) };
    }

    try {
        const store = getStore({
            name: "customer_ids",
            siteID: process.env.SITE_ID,
            token: process.env.NETLIFY_AUTH_TOKEN
        });
        const list = await store.get("list", { type: "json" });
        return { statusCode: 200, headers, body: JSON.stringify(list || []) };
    } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify([]) };
    }
};
