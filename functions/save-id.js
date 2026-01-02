const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

    try {
        console.log("受信データ:", event.body); // これでNetlifyのログに中身が出る
        const data = JSON.parse(event.body);
        const store = getStore("customer_ids");

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
        console.error("エラー詳細:", e.message);
        return { statusCode: 500, headers, body: e.message };
    }
};
