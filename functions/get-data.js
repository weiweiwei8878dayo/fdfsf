const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        // GitHubの設定
        const REPO_OWNER = "weiweiwei8878dayo";
        const REPO_NAME = "fdfsf";
        const FILE_PATH = "db.json";
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        
        // Netlifyに設定した管理者パスワード
        const ADMIN_PASS = process.env.ADMIN_PASSWORD;

        // リクエストパラメータ (?id=... または ?pw=...)
        const { id, pw } = event.queryStringParameters || {};

        if (!GITHUB_TOKEN) return { statusCode: 500, body: "Server Error: No Token" };

        // 1. GitHubからデータを取得（サーバー側で行うので安全）
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
        
        if (!res.ok) throw new Error("GitHub Fetch Failed");
        
        const fileData = await res.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const json = JSON.parse(content);

        // --- 🔒 セキュリティチェック ---

        // パターンA: 管理者パスワードが一致した場合 -> 「全員のデータ」を返す
        if (pw === ADMIN_PASS) {
            return {
                statusCode: 200,
                body: JSON.stringify(json)
            };
        }

        // パターンB: ユーザーIDが指定された場合 -> 「その人のデータだけ」返す
        if (id) {
            const userData = json.find(entry => entry.userId === id);
            if (userData) {
                return {
                    statusCode: 200,
                    body: JSON.stringify([userData]) // 配列として返す
                };
            } else {
                return { statusCode: 404, body: JSON.stringify([]) };
            }
        }

        // パターンC: パスワードもIDも違う場合 -> エラー（拒否）
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Access Denied" })
        };

    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
};
