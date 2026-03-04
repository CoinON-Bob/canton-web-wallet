#!/bin/bash

echo "=== Vercel 部署状态检查 ==="
echo "检查时间: $(date)"
echo ""

# 1. 检查网站可访问性
echo "1. 网站可访问性检查:"
if curl -s -I https://canton-web-wallet.vercel.app/ > /dev/null 2>&1; then
    echo "   ✅ https://canton-web-wallet.vercel.app/ 可访问"
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://canton-web-wallet.vercel.app/)
    echo "   HTTP 状态码: $STATUS_CODE"
else
    echo "   ❌ 网站无法访问"
fi

echo ""

# 2. 检查缓存年龄
echo "2. 缓存状态检查:"
CACHE_HEADER=$(curl -s -I https://canton-web-wallet.vercel.app/ | grep -i "age\|cache-control" | head -2)
echo "   $CACHE_HEADER"

echo ""

# 3. 检查 Git 状态
echo "3. Git 部署状态:"
cd ~/.openclaw/workspace/projects/canton-web-wallet
echo "   当前提交: $(git log --oneline -1)"
echo "   远程仓库: $(git remote -v | grep origin | head -1)"
echo "   分支: $(git branch --show-current)"

echo ""

# 4. 检查本地构建
echo "4. 本地构建状态:"
if [ -f "dist/index.html" ]; then
    echo "   ✅ 本地构建文件存在"
    BUILD_TIME=$(stat -f "%Sm" dist/index.html 2>/dev/null || date -r dist/index.html)
    echo "   构建时间: $BUILD_TIME"
else
    echo "   ❌ 本地构建文件不存在"
fi

echo ""

# 5. 部署建议
echo "5. 部署状态分析:"
echo "   根据缓存头信息，当前访问的可能是旧版本缓存。"
echo "   Vercel 部署通常需要 2-5 分钟完成。"
echo "   建议:"
echo "   1. 等待几分钟后刷新页面"
echo "   2. 强制刷新浏览器 (Ctrl+F5 或 Cmd+Shift+R)"
echo "   3. 清除浏览器缓存后访问"
echo "   4. 直接访问: https://canton-web-wallet.vercel.app/?v=$(date +%s)"

echo ""
echo "=== 检查完成 ==="