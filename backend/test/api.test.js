// End-to-end API tests.   Run with:  npm test
//
// Which database the tests use:
//  - If TEST_MONGO_URI is set, they use that (e.g. the MongoDB already on your laptop).
//    It must be a SEPARATE test database: it is wiped before and after the tests.
//      PowerShell:  $env:TEST_MONGO_URI="mongodb://127.0.0.1:27017/cleardocs_test"; npm test
//  - Otherwise they start a throwaway in-memory MongoDB (downloads it the first time).
// Either way, your real "cleardocs" database is never touched.

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

process.env.JWT_SECRET = "test_secret";
const app = require("../app");
const Service = require("../models/Service");
const User = require("../models/User");
const services = require("../data/services");

let mongo, server, base;
let userToken, otherToken, adminToken, serviceId, requestId, storedName;

async function api(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(base + path, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const type = res.headers.get("content-type") || "";
  const data = type.includes("json") ? await res.json() : await res.text();
  return { status: res.status, data };
}

function pdfForm(fields, fileName = "degree.pdf", type = "application/pdf") {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  form.append("files", new Blob(["%PDF-1.4 test"], { type }), fileName);
  return form;
}

before(async () => {
  let uri = process.env.TEST_MONGO_URI;
  if (uri) {
    if (/\/cleardocs(\?|$)/.test(uri)) {
      throw new Error('TEST_MONGO_URI points at your real "cleardocs" database. Use a separate one, e.g. .../cleardocs_test');
    }
  } else {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    mongo = await MongoMemoryServer.create();
    uri = mongo.getUri();
  }
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase(); // start from an empty test database
  await Service.insertMany(services);
  serviceId = (await Service.findOne({ slug: "apostille" }))._id.toString();
  await User.create({ name: "Admin", email: "admin@test.dev", password: "admin123", role: "admin" });
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase(); // leave nothing behind
    await mongoose.disconnect();
  }
  await mongo?.stop();
});

test("health check", async () => {
  const r = await api("GET", "/api/health");
  assert.equal(r.status, 200);
});

test("register, reject duplicates, and ignore role=admin", async () => {
  let r = await api("POST", "/api/auth/register", {
    body: { name: "Prisha", email: "Prisha@Test.dev", password: "secret1", role: "admin" },
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.role, "user");
  assert.equal(r.data.user.email, "prisha@test.dev");
  assert.ok(!("password" in r.data.user));
  userToken = r.data.token;

  r = await api("POST", "/api/auth/register", { body: { name: "X", email: "prisha@test.dev", password: "secret1" } });
  assert.equal(r.status, 409);

  r = await api("POST", "/api/auth/register", { body: { name: "X", email: "a@b.co", password: "123" } });
  assert.equal(r.status, 400);

  r = await api("POST", "/api/auth/register", { body: { name: "Other", email: "other@test.dev", password: "secret2" } });
  otherToken = r.data.token;
});

test("login works and wrong password fails", async () => {
  let r = await api("POST", "/api/auth/login", { body: { email: "prisha@test.dev", password: "wrong!" } });
  assert.equal(r.status, 401);
  r = await api("POST", "/api/auth/login", { body: { email: "admin@test.dev", password: "admin123" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.role, "admin");
  adminToken = r.data.token;
  r = await api("GET", "/api/auth/me", { token: userToken });
  assert.equal(r.data.user.name, "Prisha");
  r = await api("GET", "/api/auth/me", { token: "garbage" });
  assert.equal(r.status, 401);
});

test("services are public", async () => {
  let r = await api("GET", "/api/services");
  assert.equal(r.data.length, 4);
  r = await api("GET", "/api/services/apostille");
  assert.equal(r.data.title, "Apostille");
  r = await api("GET", "/api/services/nope");
  assert.equal(r.status, 404);
});

test("submit a request with an upload", async () => {
  let r = await api("POST", "/api/requests", { form: pdfForm({ serviceId }) });
  assert.equal(r.status, 401);

  r = await api("POST", "/api/requests", { token: userToken, form: pdfForm({ serviceId }, "virus.exe", "application/x-msdownload") });
  assert.equal(r.status, 400);

  r = await api("POST", "/api/requests", { token: userToken, form: pdfForm({ serviceId: "bad" }) });
  assert.equal(r.status, 400);

  r = await api("POST", "/api/requests", { token: userToken, form: pdfForm({ serviceId, notes: "Need for UAE" }) });
  assert.equal(r.status, 201);
  assert.equal(r.data.status, "submitted");
  assert.equal(r.data.service.title, "Apostille");
  assert.equal(r.data.files[0].originalName, "degree.pdf");
  requestId = r.data._id;
  storedName = r.data.files[0].storedName;
});

test("users only see their own requests", async () => {
  let r = await api("GET", "/api/requests/mine", { token: userToken });
  assert.equal(r.data.length, 1);
  r = await api("GET", "/api/requests/mine", { token: otherToken });
  assert.equal(r.data.length, 0);
  r = await api("GET", `/api/requests/${requestId}`, { token: otherToken });
  assert.equal(r.status, 404);
  r = await api("GET", `/api/requests/${requestId}/files/${storedName}`, { token: otherToken });
  assert.equal(r.status, 404);
  r = await api("GET", `/api/requests/${requestId}/files/${storedName}`, { token: userToken });
  assert.equal(r.status, 200);
  assert.match(r.data, /%PDF/);
  r = await api("GET", "/api/requests", { token: userToken });
  assert.equal(r.status, 403);

  // Signed, short-lived link for opening a file in the phone's browser
  r = await api("GET", `/api/requests/${requestId}/files/${storedName}/link`, { token: otherToken });
  assert.equal(r.status, 404);
  r = await api("GET", `/api/requests/${requestId}/files/${storedName}/link`, { token: userToken });
  assert.equal(r.status, 200);
  const path = new URL(r.data.url).pathname + new URL(r.data.url).search;
  r = await api("GET", path);
  assert.equal(r.status, 200);
  assert.match(r.data, /%PDF/);
  r = await api("GET", `/api/files/${storedName}?sig=forged`);
  assert.equal(r.status, 403);
});

test("admin updates status and history is kept", async () => {
  let r = await api("PATCH", `/api/requests/${requestId}/status`, { token: userToken, body: { status: "completed" } });
  assert.equal(r.status, 403);
  r = await api("PATCH", `/api/requests/${requestId}/status`, { token: adminToken, body: { status: "flying" } });
  assert.equal(r.status, 400);
  r = await api("PATCH", `/api/requests/${requestId}/status`, { token: adminToken, body: { status: "in_review", note: "Docs look good" } });
  assert.equal(r.status, 200);
  r = await api("GET", "/api/requests", { token: adminToken });
  assert.equal(r.data.length, 1);
  assert.equal(r.data[0].user.name, "Prisha");
  r = await api("GET", `/api/requests/${requestId}`, { token: userToken });
  assert.equal(r.data.status, "in_review");
  assert.equal(r.data.history.length, 2);
});

test("contact form enquiries", async () => {
  let r = await api("POST", "/api/enquiries", { body: { name: "A", email: "not-an-email", message: "hi" } });
  assert.equal(r.status, 400);
  r = await api("POST", "/api/enquiries", { body: { name: "A", email: "a@b.co", message: "Need attestation" } });
  assert.equal(r.status, 201);
  r = await api("GET", "/api/enquiries", { token: adminToken });
  assert.equal(r.data.length, 1);
  r = await api("GET", "/api/enquiries");
  assert.equal(r.status, 401);
});

test("bad JSON and unknown routes return clean errors", async () => {
  const res = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad" });
  assert.equal(res.status, 400);
  const r = await api("GET", "/api/nothing");
  assert.equal(r.status, 404);
});
