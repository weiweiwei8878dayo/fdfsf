const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => { // contextを追加
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

    try {
        const data = JSON.parse(event.body);
        
        // contextから自動的にデプロイ情報を取得してストアを開く
        const store = getStore({
            name: "customer_ids",
            siteID: process.env.SITE_ID,
            token: process.env.NETLIFY_AUTH_TOKEN
        });

        let list = await store.get("list", { type: "json" }) || [];
        list.push({
            userId: data.userId,
            userName: data.userName,
            amount: data.amount,
            banOption: data.banOption,
            date: data.date || new Date().toISOString()
        });

        await store.setJSON("list", list);
        return { statusCode: 200, headers, body: "OK" };
    } catch (e) {
        console.error("Save Error:", e.message);
        return { statusCode: 500, headers, body: e.message };
    }
};
