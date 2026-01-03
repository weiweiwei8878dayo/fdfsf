const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

    try {
        const store = getStore("daikou_data");

        // --- 進捗検索 (GET) ---
        if (event.httpMethod === "GET") {
            const id = event.queryStringParameters.id;
            if (!id) return { statusCode: 400, headers, body: "IDなし" };

            // Blobsから直接取得
            const data = await store.get(id, { type: "json" });
            if (!data) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: "見つかりません" }) };
            }
            return { statusCode: 200, headers, body: JSON.stringify(data) };
        }

        // --- データ保存・更新 (POST) ---
        if (event.httpMethod === "POST") {
            const body = JSON.parse(event.body);
            const id = body.userId; 
            if (!id) return { statusCode: 400, headers, body: "IDなし" };

            // 既存データがあればマージ、なければ新規
            const current = await store.get(id, { type: "json" }) || {};
            const updatedData = {
                ...current,
                ...body,
                date: current.date || new Date().toISOString(),
                lastUpdate: new Date().toISOString()
            };

            await store.setJSON(id, updatedData);
            return { statusCode: 200, headers, body: "OK" };
        }
    } catch (err) {
        console.error("Error:", err);
        return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
    }
};
