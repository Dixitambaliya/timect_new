import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { signAdminToken } from "../src/admin/lib/auth";
import { ADMIN_COOKIE } from "../src/admin/lib/constants";
import { adminPath } from "../src/admin/lib/routing";

test("admin hostname routing and protection", async () => {
  const token = await signAdminToken({ id: 1, email: "test@example.com", fullName: "Test", role: "admin" });
  for (const path of ["/", "/products", "/products/new", "/products/123/edit", "/collections", "/settings", "/products/item.v2/edit"]) {
    const response = await proxy(new NextRequest(`https://admin.timectwatches.com${path}?page=2`, { headers: { cookie: `${ADMIN_COOKIE}=${token}` } }));
    assert.equal(response.headers.get("x-middleware-rewrite"), `https://admin.timectwatches.com/admin${path === "/" ? "" : path}?page=2`);
  }
  const response = await proxy(new NextRequest("https://admin.timectwatches.com/products?page=2"));
  const login = new URL(response.headers.get("location")!);
  assert.equal(login.pathname, "/login");
  assert.equal(login.searchParams.get("next"), "/products?page=2");
});

test("public hosts, local development, APIs and assets", async () => {
  for (const host of ["timectwatches.com", "www.timectwatches.com"]) {
    const response = await proxy(new NextRequest(`https://${host}/admin/products/123/edit?q=watch`));
    assert.equal(response.headers.get("location"), "https://admin.timectwatches.com/products/123/edit?q=watch");
    const publicResponse = await proxy(new NextRequest(`https://${host}/product/watch`));
    assert.equal(publicResponse.headers.get("x-middleware-next"), "1");
  }
  const local = await proxy(new NextRequest("http://localhost:3000/admin/products"));
  assert.equal(new URL(local.headers.get("location")!).pathname, "/admin/login");
  for (const path of ["/api/admin/live-visitors", "/api/blog/posts", "/_next/static/app.js", "/favicon.ico"]) {
    const response = await proxy(new NextRequest(`https://admin.timectwatches.com${path}`));
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
  assert.equal(adminPath("/admin/products?q=1", true), "/products?q=1");
  assert.equal(adminPath("/admin/products", false), "/admin/products");
  assert.equal(adminPath("/administrator", true), "/administrator");
});


test("all public assets bypass admin rewriting with or without a session", async () => {
  const token = await signAdminToken({ id: 1, email: "test@example.com", fullName: "Test", role: "admin" });
  const assets = await readdir(new URL("../public/", import.meta.url), { recursive: true, withFileTypes: true });
  for (const asset of assets.filter((entry) => entry.isFile())) {
    const path = `/${asset.name}`;
    for (const cookie of ["", `${ADMIN_COOKIE}=${token}`]) {
      const response = await proxy(new NextRequest(`https://admin.timectwatches.com${path}?v=1`, { headers: { cookie } }));
      assert.equal(response.headers.get("x-middleware-next"), "1", path);
      assert.equal(response.headers.get("location"), null, path);
      assert.equal(response.headers.get("x-middleware-rewrite"), null, path);
    }
  }
  const manifest = JSON.parse(await readFile(new URL("../public/site.webmanifest", import.meta.url), "utf8"));
  assert.ok(manifest.icons.length > 0);
  for (const icon of manifest.icons) {
    await readFile(new URL(`../public${icon.src}`, import.meta.url));
  }
  const protectedAssetLikeRoute = await proxy(new NextRequest("https://admin.timectwatches.com/products/item.png"));
  assert.equal(new URL(protectedAssetLikeRoute.headers.get("location")!).pathname, "/login");
});
