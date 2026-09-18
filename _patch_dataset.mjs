import fs from "node:fs";
const ROOT = "D:/A-三院项目/通用型科研平台/src";

/* ---------- menuConfig.ts ---------- */
{
  const P = ROOT + "/lib/menuConfig.ts";
  let t = fs.readFileSync(P, "utf8");
  const must = (a, l) => { if (!t.includes(a)) throw new Error("menuConfig anchor: " + l); };

  // 1) 新增「数据集管理」菜单项，原始数据管理顺延
  must(`      { id: "raw-data-mgmt", title: "原始数据管理", defaultTitle: "原始数据管理", iconName: "HardDriveDownload", visible: true, order: 4, groupId: "research-middle-platform" },`, "raw data item");
  t = t.replace(
    `      { id: "raw-data-mgmt", title: "原始数据管理", defaultTitle: "原始数据管理", iconName: "HardDriveDownload", visible: true, order: 4, groupId: "research-middle-platform" },`,
    `      { id: "dataset-mgmt", title: "数据集管理", defaultTitle: "数据集管理", iconName: "Table", visible: true, order: 4, groupId: "research-middle-platform" },
      { id: "raw-data-mgmt", title: "原始数据管理", defaultTitle: "原始数据管理", iconName: "HardDriveDownload", visible: true, order: 5, groupId: "research-middle-platform" },`
  );

  // 2) 图标导入与图标映射
  must(`  FolderKanban,\n  type LucideIcon\n} from "lucide-react";`, "icon import tail");
  t = t.replace(`  FolderKanban,\n  type LucideIcon\n} from "lucide-react";`, `  FolderKanban,\n  Table,\n  type LucideIcon\n} from "lucide-react";`);
  must(`  FolderKanban\n};`, "icon map tail");
  t = t.replace(`  FolderKanban\n};`, `  FolderKanban,\n  Table\n};`);

  // 3) 菜单结构变化，提升存储版本并修复历史键清理（含上一轮重复行）
  must(`const STORAGE_KEY = "system_menu_configuration_v9";`, "storage key decl");
  t = t.replace(`const STORAGE_KEY = "system_menu_configuration_v9";`, `const STORAGE_KEY = "system_menu_configuration_v10";`);

  const dirtyBlock = `        localStorage.removeItem("system_menu_configuration_v8");
        localStorage.removeItem("system_menu_configuration_v8");
      localStorage.removeItem("system_menu_configuration_v7");`;
  must(dirtyBlock, "dirty legacy block");
  t = t.replace(dirtyBlock, `        localStorage.removeItem("system_menu_configuration_v9");
        localStorage.removeItem("system_menu_configuration_v8");
        localStorage.removeItem("system_menu_configuration_v7");`);

  const getterBlock = `      localStorage.removeItem("system_menu_configuration_v8");
      localStorage.removeItem("system_menu_configuration_v7");`;
  must(getterBlock, "getter legacy block");
  t = t.replace(getterBlock, `      localStorage.removeItem("system_menu_configuration_v9");
      localStorage.removeItem("system_menu_configuration_v8");
      localStorage.removeItem("system_menu_configuration_v7");`);

  fs.writeFileSync(P, t, "utf8");
  console.log("menuConfig.ts ok");
}

/* ---------- App.tsx ---------- */
{
  const P = ROOT + "/App.tsx";
  let t = fs.readFileSync(P, "utf8");
  const must = (a, l) => { if (!t.includes(a)) throw new Error("App anchor: " + l); };

  must(`import { RawDataManagement } from "./components/RawDataManagement";`, "import raw data");
  t = t.replace(
    `import { RawDataManagement } from "./components/RawDataManagement";`,
    `import { DatasetManagement } from "./components/DatasetManagement";\nimport { RawDataManagement } from "./components/RawDataManagement";`
  );

  must(`      case "raw-data-mgmt":\n        return <RawDataManagement />;`, "route raw data");
  t = t.replace(
    `      case "raw-data-mgmt":\n        return <RawDataManagement />;`,
    `      case "dataset-mgmt":\n        return <DatasetManagement />;\n      case "raw-data-mgmt":\n        return <RawDataManagement />;`
  );

  fs.writeFileSync(P, t, "utf8");
  console.log("App.tsx ok");
}