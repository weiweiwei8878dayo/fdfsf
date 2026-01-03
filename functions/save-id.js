const fetch = require('node-fetch');

exports.handler = async (event) => {
    // POSTリクエスト以外は拒否
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { userId, userName, status, lastUpdate, item, amount, banOption } = data;

        // GitHubのリポジトリ情報
        const REPO_OWNER = "weiweiwei8878dayo";
        const REPO_NAME = "fdfsf";
        const FILE_PATH = "db.json";
        const BRANCH = "main";
        // Netlifyの環境変数からトークンを取得
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 

        if (!GITHUB_TOKEN) {
            return { statusCode: 500, body: "GitHub Token not configured." };
        }

        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

        // 1. 現在のdb.jsonを取得
        const getRes = await fetch(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        
        if (!getRes.ok) throw new Error("Failed to fetch db.json");
        
        const fileData = await getRes.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        let json = JSON.parse(content);

        // 2. データを更新または追加
        const index = json.findIndex(entry => entry.userId === userId);
        
        const newEntry = {
            userId,
            userName,
            status,
            lastUpdate,
            // 既存の値を保持しつつ、新しい値があれば更新
            item: item || (index !== -1 ? json[index].item : "-"),
            amount: amount || (index !== -1 ? json[index].amount : 0),
            banOption: banOption || (index !== -1 ? json[index].banOption : "-")
        };

        if (index !== -1) {
            json[index] = { ...json[index], ...newEntry };
        } else {
            json.push(newEntry);
        }

        // 3. GitHubへ保存（Push）
        const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update status for ${userName}`,
                content: updatedContent,
                sha: fileData.sha,
                branch: BRANCH
            })
        });

        if (!putRes.ok) throw new Error("Failed to update db.json");

        return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: error.message };
    }
};
