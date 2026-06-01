"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

class JsonRepository {
  constructor(filePath, initialValue) {
    this.filePath = filePath;
    this.initialValue = initialValue;
    this.writeQueue = Promise.resolve();
  }

  async read() {
    try {
      return JSON.parse(await fs.readFile(this.filePath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await this.write(this.initialValue);
      return structuredClone(this.initialValue);
    }
  }

  async write(value) {
    this.writeQueue = this.writeQueue.then(async () => {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
      await fs.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
      await fs.rename(temporaryPath, this.filePath);
    });
    return this.writeQueue;
  }
}

module.exports = { JsonRepository };
