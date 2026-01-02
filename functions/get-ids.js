const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    const pw = event.queryStringParameters.pw;
    if (pw !== "yudai2011") {
        return { statusCode: 403, headers, body: JSON.stringify({ error: "Forbidden" }) };
    }

    try {
        const store = getStore("customer_ids");
        const list = await store.get("list", { type: "json" });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(list || [])
        };
    } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify([]) };
    }
};
