const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    };
    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

    const store = getStore("daikou_data");

    // 進捗確認 (GET)
    if (event.httpMethod === "GET") {
        const id = event.queryStringParameters.id;
        const data = await store.get(id, { type: "json" });
        if (!data) return { statusCode: 404, headers, body: JSON.stringify({ error: "No data" }) };
        return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ステータス更新 (POST)
    if (event.httpMethod === "POST") {
        const body = JSON.parse(event.body);
        const id = body.userId; // Discord ID
        
        let current = await store.get(id, { type: "json" }) || {};
        const newData = { ...current, ...body };
        
        await store.setJSON(id, newData);
        return { statusCode: 200, headers, body: "OK" };
    }
};
