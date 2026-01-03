const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const REPO_OWNER = "weiweiwei8878dayo";
        const REPO_NAME = "fdfsf";
        const FILE_PATH = "db.json";
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const ADMIN_PASS = process.env.ADMIN_PASSWORD;

        const { id, pw } = event.queryStringParameters || {};

        if (!GITHUB_TOKEN) return { statusCode: 500, body: "Server Error: No Token" };

        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
        
        if (!res.ok) throw new Error("GitHub Fetch Failed");
        
        const fileData = await res.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const json = JSON.parse(content);

        // --- 🔍 パターン別処理 ---

        // 1. 管理者: 全データを返す
        if (pw === ADMIN_PASS) {
            return { statusCode: 200, body: JSON.stringify(json) };
        }

        // 2. ✨ 追加機能: 待ち人数だけを返す (個人情報は返さない)
        if (id === 'queue_count') {
            // 「待ち」か「作業」を含み、「キャンセル」や「完了」ではないものをカウント
            const activeCount = json.filter(entry => 
                (entry.status.includes('待ち') || entry.status.includes('作業')) &&
                !entry.status.includes('キャンセル') &&
                !entry.status.includes('完了')
            ).length;
            
            return { statusCode: 200, body: JSON.stringify({ count: activeCount }) };
        }

        // 3. 一般ユーザー: 自分のIDのデータだけ返す
        if (id) {
            const userData = json.find(entry => entry.userId === id);
            if (userData) {
                return { statusCode: 200, body: JSON.stringify([userData]) };
            } else {
                return { statusCode: 404, body: JSON.stringify([]) };
            }
        }

        return { statusCode: 403, body: JSON.stringify({ error: "Access Denied" }) };

    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
};
