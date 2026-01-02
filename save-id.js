const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    const data = JSON.parse(event.body);
    const store = getStore("customer_ids");
    
    // 既存のリストを取得して追加
    let currentList = await store.get("list", { type: "json" }) || [];
    currentList.push(data);
    await store.setJSON("list", currentList);

    return { statusCode: 200, body: "Saved" };
};
