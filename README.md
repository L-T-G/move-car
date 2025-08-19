# Parking Pro

## project structure

app/
│
├── (public)/                # 公开页面（不带后台布局）
│   ├── page.tsx              # 首页 (/)
│   ├── login/
│   │   └── page.tsx          # 登录页 (/login)
│   └── register/
│       └── page.tsx          # 注册页 (/register)
│
├── admin/                    # 后台管理页面
│   ├── layout.tsx            # Admin 布局 (侧边栏 + Header)
│   ├── page.tsx               # Admin 仪表盘首页 (/admin)
│   ├── mobilecall/
│   │   └── page.tsx          # 移动呼叫管理 (/admin/mobilecall)
│   ├── qrcode/
│   │   └── page.tsx          # 二维码管理 (/admin/qrcode)
│   └── users/
│       └── page.tsx          # 用户管理 (/admin/users)
│
├── api/                      # 后端 API (Route Handlers)
│   ├── qrcode/
│   │   ├── generate/
│   │   │   └── route.ts      # POST /api/qrcode/generate - 批量生成二维码
│   │   ├── bind/
│   │   │   └── route.ts      # POST /api/qrcode/bind - 绑定二维码
│   │   └── list/
│   │       └── route.ts      # GET /api/qrcode/list - 获取二维码列表
│   └── user/
│       ├── list/
│       │   └── route.ts      # GET /api/user/list - 获取用户列表
│       └── create/
│           └── route.ts      # POST /api/user/create - 创建用户
│
└── layout.tsx                # 根布局（全局 <html> / <body>）

## 项目功能模块
功能模块设计
1. 二维码绑定模块（/bind/[code]）
功能

接收二维码 code 参数

查询二维码状态（已绑定 / 未绑定）

未绑定 → 提示登录，登录后成为二维码主人

已绑定 → 展示绑定手机号列表

权限

未登录 → 只能查看

已登录 & 是主人 → 可管理绑定手机号（增删改、设置公开）

已登录 & 不是主人 → 只能解绑自己

2. 用户登录模块
支持扫码进入后直接登录（OAuth / 短信验证码等）

登录后可获取当前用户 ID，用于判断二维码绑定权限

3. 绑定手机号管理模块
功能

主人 → 添加手机号

主人 → 删除手机号

主人 → 设置手机号公开/私密

普通用户 → 只能解绑自己的手机号

权限控制

服务端检查操作用户是否是主人

数据库记录每个手机号与用户 ID 的关系

4. 二维码管理模块（Admin 后台）
功能

生成二维码（唯一 code）

查看二维码绑定的手机号

修改二维码状态（有效/失效）

批量导出二维码绑定数据

权限

仅管理员可访问