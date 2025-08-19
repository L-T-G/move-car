# 格式化执行
npx prisma format
# 第一次创建表
npx prisma migrate dev --name init

# 未插入数据时，更新字段
# npx prisma migrate dev --name add_imageUrl_to_qrcode