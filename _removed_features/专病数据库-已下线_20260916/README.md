# 已下线的专病数据库功能（2026-09-16 按需求移除）

按需求从「专病数据库」分组中删除以下三个功能，相关页面组件在此留存备查：

- 病原微生物数据库（数据库概览 / 病原体搜索 / 病原体详情）
  - PathogenDatabase.tsx、PathogenSearch.tsx、PathogenDetail.tsx
- 免疫基因组学综合数据库（数据库中心 / 数据库管理）
  - DatabaseCenter.tsx、BCRTCRDatabase.tsx
- 蛋白质结构预测专用数据库
  - ProteinDatabase.tsx

同步改动：
- src/lib/menuConfig.ts 中移除上述 3 个菜单项（含二级子菜单）
- src/App.tsx 中移除对应路由分支与组件引用
- src/components/RoleManagement.tsx 中同步调整「专病数据库」模块的权限项，改为「公共数据库管理」与「自建数据库」

如需恢复：把本目录下的组件文件移回 src/components/，并在 menuConfig.ts 与 App.tsx 中重新加入菜单项与路由分支即可。