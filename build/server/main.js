"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const express = require("express");
const path = require("path");
const fs = require("fs");
const AsyncLock = require("async-lock");
const lodashEs = require("lodash-es");
const sha1 = require("sha1");
const sharp = require("sharp");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const serverBase = "/srv";
const endPoints = {
  hello: `${serverBase}/hello`,
  inventory: `${serverBase}/inventory`,
  uploads: `${serverBase}/uploads`
};
const imgExtensions = /* @__PURE__ */ new Set(["jpg", "png", "gif"]);
const lock = new AsyncLock({ timeout: 5e3 });
class FileDB {
  constructor(filePath) {
    __publicField(this, "filePath");
    __publicField(this, "data", /* @__PURE__ */ new Map());
    this.filePath = filePath;
    this.loadData();
  }
  loadData() {
    fs__namespace.readFile(this.filePath, "utf-8", (fileData) => {
      const list = JSON.parse("[" + fileData + "]");
      let requireCompact = false;
      for (const t of list) {
        if (!t || !t.id)
          continue;
        const old = this.getById(t.id);
        if (old) {
          requireCompact = true;
        }
        if (!old || (t._v || 0) > (old._v || 0)) {
          this.data.set(t.id, JSON.stringify(t));
        }
      }
      if (requireCompact) {
        this.compact();
      }
    });
  }
  compact() {
    lock.acquire(this.filePath, (done) => {
      const list = Array.from(this.data.values()).join(",");
      fs__namespace.writeFile(this.filePath, list, done);
    });
  }
  getAll() {
    return Array.from(this.data.values(), (d) => JSON.parse(d));
  }
  getById(id) {
    const s = this.data.get(id);
    return s ? JSON.parse(s) : null;
  }
  upsert(t) {
    const old = this.getById(t.id);
    if (old && t._v !== old._v) {
      throw new Error("version conflict");
    }
    t._v = ((old == null ? void 0 : old._v) || 0) + 1;
    const line = JSON.stringify(t, null, 2);
    lock.acquire(this.filePath, (done) => {
      this.data.set(t.id, line);
      fs__namespace.appendFile(this.filePath, "," + line, done);
    });
    return t.id;
  }
}
class InventoryDB {
  constructor(file) {
    __publicField(this, "db");
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    this.db = new FileDB(file);
    this.load();
  }
  load() {
    const all = this.db.getAll();
    const parents = [];
    const children = {};
    for (const item of all) {
      if ("deleted" in item && item.deleted)
        continue;
      if ("_children" in item) {
        parents.push(item);
      } else {
        children[item.id] = item;
      }
    }
    const uiparents = parents.map(({ _children, ...item }) => ({
      ...item,
      _children: _children.map((id) => children[id])
    }));
    for (const p of uiparents) {
      this.cache.set(p.id, p);
    }
  }
  getAll() {
    return Array.from(this.cache.values());
  }
  getById(id) {
    return this.cache.get(id);
  }
  upsert(t) {
    const { _children, ...item } = t;
    _children.forEach((c) => {
      if (!lodashEs.isEqual(this.cache.get(c.id), c)) {
        this.db.upsert(c);
      }
    });
    const parentItem = { ...item, _children: _children.map((c) => c.id) };
    const id = this.db.upsert(parentItem);
    t._v = parentItem._v;
    this.cache.set(id, t);
  }
}
const useInventoryHandler = (app2, reqPath, dbpath) => {
  const inventoryDB = new InventoryDB(dbpath);
  app2.get(reqPath, (req, res) => {
    res.json(inventoryDB.getAll());
  });
  app2.get(`${reqPath}/:id`, (req, res) => {
    const item = inventoryDB.getById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "item not found " + req.params.id });
    }
  });
  app2.put(`${reqPath}/:id`, (req, res) => {
    const item = req.body;
    inventoryDB.upsert(item);
    res.status(200).json(item);
  });
};
const useUploadHandler = (app2, reqPath, folder, folderThumbs) => {
  app2.post(`${reqPath}/:name`, async (req, res) => {
    const fileData = req.body;
    const ext = path.extname(req.params.name).substring(1).toLowerCase();
    if (!fileData) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const shaName = sha1(fileData);
    const fileName = `${shaName}.${ext}`;
    const filePath = path.join(folder, fileName);
    const thumbnailPath = path.join(folderThumbs, fileName);
    const done = () => {
      const r = {
        fileName
      };
      res.json(r);
    };
    fs.access(filePath, (err) => {
      if (err) {
        fs.writeFile(filePath, fileData, done);
        if (imgExtensions.has(ext))
          sharp(fileData).resize(320, 200, { fit: "contain" }).toFile(thumbnailPath);
      } else {
        done();
      }
    });
  });
  app2.use(reqPath, express.static(folder));
};
const args = process.argv.slice(2);
const port = args[0];
const app = express();
const clientPath = path.join(process.cwd(), "build", "client");
const clientHandler = express.static(clientPath);
const dataPath = path.join(process.cwd(), "data");
const dbfile = path.join(dataPath, "db", "inventory.json");
const uploads = path.join(dataPath, "uploads");
const thumbs = path.join(uploads, "thumbs");
useInventoryHandler(app, endPoints.inventory, dbfile);
useUploadHandler(app, endPoints.uploads, uploads, thumbs);
app.use((req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  clientHandler(req, res, next);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
