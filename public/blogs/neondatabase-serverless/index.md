因为调用API， 在 /src/app/api/neon/route.ts 代码提交一直不成功，改了很多遍，最后找到原因：没有@neondatabase/serverless依赖

正常使用 Neon 数据库，在 package.json的 dependencies中添加 @neondatabase/serverless依赖是必要的一步。

![](/blogs/neondatabase-serverless/13d3d4ee297953e0.webp)


在这里大概率提交部署会失败，所以需要在 Vercel 设置一下：

确认 Vercel 设置 （2025-blog-public 里的）

Settings → Build & Development  → Install Command 

框里必须是：

pnpm install --no-frozen-lockfile

→ 点 Save

![](/blogs/neondatabase-serverless/93813edd2d914a53.webp)

最后再重新提交依赖添加