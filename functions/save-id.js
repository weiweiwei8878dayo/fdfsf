const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

    const store = getStore("daikou_data");

    // --- 進捗確認（GET） ---
    if (event.httpMethod === "GET") {
        const orderId = event.queryStringParameters.id;
        if (!orderId) return { statusCode: 400, headers, body: "IDが必要です" };

        const data = await store.get(orderId, { type: "json" });
        if (!data) return { statusCode: 404, headers, body: "依頼が見つかりません" };

        return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // --- Botからの更新（POST） ---
    if (event.httpMethod === "POST") {
        const body = JSON.parse(event.body);
        // IDはユーザーIDなど一意のものを使用
        const orderId = body.userId; 
        
        // 既存データがあればマージ、なければ新規
        let current = await store.get(orderId, { type: "json" }) || {};
        const updated = { ...current, ...body, lastUpdate: new Date().toISOString() };
        
        await store.setJSON(orderId, updated);
        return { statusCode: 200, headers, body: JSON.stringify({ status: "ok" }) };
    }
};
