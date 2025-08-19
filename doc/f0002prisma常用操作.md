项目根目录执行


生成并执行迁移
```bash
npx prisma migrate dev --name add_updatedAt --create-only


```

重置数据库（开发环境）
```bash
npx prisma migrate reset


```

测试环境sqlite向线上环境迁移
```bash
npx prisma migrate dev --name init


```
这个命令会做以下几件事情：

创建新的迁移目录（prisma/migrations）。

基于你的 schema.prisma 文件生成 PostgreSQL 迁移文件。

同时会把数据库和迁移文件同步。

这样会重新生成所有的数据库结构并确保 PostgreSQL 与迁移历史一致。


```bash
npx prisma generate

```
迁移完成后，重新生成 Prisma Client 以确保你的代码可以使用新的数据库结构：

```bash
npx prisma db push

```
验证连接

确保你可以正常连接到 PostgreSQL 数据库，并验证数据库的表和数据。