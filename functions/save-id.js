const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    // 通信の許可設定 (CORS)
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

    // POST以外は拒否
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    try {
        const data = JSON.parse(event.body);
        const store = getStore("customer_ids");

        // 既存のリストを読み込む
        let list = await store.get("list", { type: "json" }) || [];

        // 新しいデータを追加
        list.push({
            userId: data.userId,
            userName: data.userName,
            amount: data.amount,
            banOption: data.banOption,
            date: data.date || new Date().toISOString()
        });

        // 保存
        await store.setJSON("list", list);

        return { statusCode: 200, headers, body: JSON.stringify({ status: "success" }) };
    } catch (e) {
        console.error("Save Error:", e);
        return { statusCode: 500, headers, body: e.message };
    }
};
