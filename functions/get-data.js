const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const REPO_OWNER = "weiweiwei8878dayo";
        const REPO_NAME = "fdfsf";
        const FILE_PATH = "db.json";
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const ADMIN_PASS = process.env.ADMIN_PASSWORD;

        if (!GITHUB_TOKEN) return { statusCode: 500, body: "Server Error: No Token" };

        // 共通: DB取得関数
        const getDbData = async () => {
            const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
            const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
            if (!res.ok) throw new Error("GitHub Fetch Failed");
            const fileData = await res.json();
            return JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
        };

        // --- 1. 管理者ログイン (POST通信) ---
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            if (body.password === ADMIN_PASS) {
                const json = await getDbData();
                return { statusCode: 200, body: JSON.stringify(json) };
            } else {
                return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
            }
        }

        // --- 2. GET通信 (ユーザー検索など) ---
        const { id, orderId } = event.queryStringParameters || {};
        const json = await getDbData();

        // 待ち人数カウント (個人情報は返さない)
        if (id === 'queue_count') {
            const activeCount = json.filter(entry => 
                !entry.status.includes('完了') &&
                !entry.status.includes('キャンセル')
            ).length;
            return { statusCode: 200, body: JSON.stringify({ count: activeCount }) };
        }

        // ユーザー検索 (IDと注文IDの両方が必須)
        if (id && orderId) {
            const userData = json.find(entry => entry.userId === id && entry.orderId === orderId);
            if (userData) {
                return { statusCode: 200, body: JSON.stringify([userData]) };
            } else {
                return { statusCode: 404, body: JSON.stringify([]) };
            }
        }

        // それ以外は拒否
        return { statusCode: 403, body: JSON.stringify({ error: "Access Denied" }) };

    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
};
