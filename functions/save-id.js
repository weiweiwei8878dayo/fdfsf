const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    try {
        const data = JSON.parse(event.body);
        const store = getStore("customer_ids");
        
        let currentList = await store.get("list", { type: "json" }) || [];
        currentList.push(data);
        
        await store.setJSON("list", currentList);

        return { statusCode: 200, body: "Saved" };
    } catch (e) {
        return { statusCode: 500, body: e.message };
    }
};
