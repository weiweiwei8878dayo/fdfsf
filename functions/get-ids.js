const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    // URLの ?pw=yudai2011 をチェック
    const pw = event.queryStringParameters.pw;
    if (pw !== "yudai2011") {
        return { statusCode: 403, body: " Forbidden" };
    }

    try {
        const store = getStore("customer_ids");
        const list = await store.get("list", { type: "json" });

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify(list || [])
        };
    } catch (e) {
        return { statusCode: 200, body: JSON.stringify([]) };
    }
};