const PORT = 9228;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find(t => t.type === "page" && t.url.includes("3000"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); });
await new Promise((res) => ws.addEventListener("open", res));
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) return "EXC: " + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result?.result?.value;
};
await send("Runtime.enable");
const center = async (expr) => evalJs(`(() => { const el = ${expr}; if(!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }; })()`);
const realClick = async (pt) => { if (!pt) return "no point"; await send("Input.dispatchMouseEvent", { type: "mousePressed", x: pt.x, y: pt.y, button: "left", clickCount: 1 }); await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pt.x, y: pt.y, button: "left", clickCount: 1 }); return "clicked"; };
const pager = () => evalJs(`(() => { const t = document.body.innerText.replace(/\\s+/g," "); const i = t.indexOf("共 "); return i>=0 ? t.slice(i, i+42) : "none"; })()`);

console.log("--- 关键词搜索 ---");
const inputPt = await center(`Array.from(document.querySelectorAll("input")).find(i => i.placeholder && i.placeholder.includes("搜索编号"))`);
console.log("focus search:", await realClick(inputPt));
await send("Input.insertText", { text: "NanoDSF" });
await sleep(900);
console.log("pager:", await pager(), "| rows:", await evalJs(`document.querySelectorAll("table tbody tr").length`));
console.log("matched name:", await evalJs(`(() => { const tr = document.querySelector("table tbody tr"); return tr ? tr.innerText.replace(/\\s+/g," ").slice(0, 70) : "none"; })()`));

// 清空搜索
await evalJs(`(() => { const i = Array.from(document.querySelectorAll("input")).find(x => x.placeholder && x.placeholder.includes("搜索编号")); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set; setter.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true })); return 1; })()`);
await sleep(700);
console.log("after clear:", await pager());

console.log("--- 关联项目筛选 ---");
console.log("open project select:", await realClick(await center(`document.querySelector("button[role=combobox]")`)));
await sleep(800);
console.log("options:", JSON.stringify(await evalJs(`(() => Array.from(document.querySelectorAll("[role=option]")).map(o=>o.innerText.trim()))()`)));
console.log("pick PET:", await realClick(await center(`Array.from(document.querySelectorAll("[role=option]")).find(o => o.innerText.includes("PET"))`)));
await sleep(1000);
console.log("pager:", await pager(), "| rows:", await evalJs(`document.querySelectorAll("table tbody tr").length`));
console.log("all PET?", await evalJs(`(() => Array.from(document.querySelectorAll("table tbody tr")).every(tr => tr.innerText.includes("PET")))()`));
console.log("trigger label:", await evalJs(`(() => { const b = document.querySelector("button[role=combobox]"); return b ? b.innerText.replace(/\\s+/g," ").trim() : "none"; })()`));
console.log("exceptions:", events.filter(e => e.method === "Runtime.exceptionThrown").length);
ws.close(); process.exit(0);