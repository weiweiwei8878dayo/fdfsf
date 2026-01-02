const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    // POST以外は受け付けない
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const data = JSON.parse(event.body);
        const store = getStore("customer_ids");

        // 今あるリストを読み込む（なければ空配列）
        let list = await store.get("list", { type: "json" }) || [];

        // 新しい依頼データを追加
        list.push({
            userId: data.userId,
            userName: data.userName,
            amount: data.amount,
            banOption: data.banOption,
            date: data.date || new Date().toISOString()
        });

        // データを保存
        await store.setJSON("list", list);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Success" })
        };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, body: e.message };
    }
};