import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(":memory:");
db.exec("CREATE TABLE t (a TEXT)");
db.prepare("INSERT INTO t VALUES (?)").run("hello");
console.log("sqlite ok:", db.prepare("SELECT a FROM t").get()?.a);
