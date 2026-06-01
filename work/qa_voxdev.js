"use strict";

const path = require("node:path");
const { chromium } = require("playwright");

process.env.SITE_URL = "http://127.0.0.1:3000";
process.env.ADMIN_PASSWORD = "senha-local-de-validacao";

const { server } = require("../outputs/voxdev/server");

async function main() {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(3000, "127.0.0.1", resolve);
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(__dirname, "voxdev-desktop.png"), fullPage: true });
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(__dirname, "voxdev-monitor-desktop.png") });
  await page.locator("#servicos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(__dirname, "voxdev-services-desktop.png") });

  const result = {
    title: await page.title(),
    headline: await page.locator("h1").innerText(),
    monitorVisible: await page.locator(".monitor-frame").isVisible(),
    serviceCards: await page.locator(".service-card").count(),
    faqItems: await page.locator(".faq-item").count(),
    disabledContacts: await page.locator(".contact-button.is-disabled").count(),
    csp: (await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content") || "").includes("sha256-")
  };

  await page.locator("#comment-name").fill("Validação local");
  await page.locator("#comment-message").fill("Mensagem temporária enviada pelo teste visual.");
  await page.locator("[data-comment-submit]").click();
  await page.locator("[data-form-status]").filter({ hasText: "Mensagem publicada com sucesso." }).waitFor();
  result.commentFlow = "ok";

  const comments = await (await fetch("http://127.0.0.1:3000/api/comments")).json();
  const temporary = comments.comments.find((comment) => comment.name === "Validação local");
  if (temporary) {
    await fetch(`http://127.0.0.1:3000/api/comments/${temporary.id}`, {
      method: "DELETE",
      headers: { "X-Admin-Password": "senha-local-de-validacao" }
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#inicio").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(__dirname, "voxdev-hero-mobile.png") });
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(__dirname, "voxdev-monitor-mobile.png") });
  await page.locator("#contato").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(__dirname, "voxdev-contact-mobile.png") });
  await page.locator("#comentarios").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(__dirname, "voxdev-comments-mobile.png") });
  await page.screenshot({ path: path.join(__dirname, "voxdev-mobile.png"), fullPage: true });
  result.mobileHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  result.whatsappHiddenWithoutNumber = await page.locator("[data-floating-whatsapp]").evaluate((element) => element.hidden);
  result.mobileMonitor = await page.locator(".monitor-frame").evaluate((image) => {
    const box = image.getBoundingClientRect();
    return {
      width: Math.round(box.width),
      height: Math.round(box.height),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedRatio: Number((box.width / box.height).toFixed(3)),
      naturalRatio: Number((image.naturalWidth / image.naturalHeight).toFixed(3))
    };
  });
  result.mobileMonitorStage = await page.locator(".monitor-stage").evaluate((stage) => {
    const box = stage.getBoundingClientRect();
    return {
      width: Math.round(box.width),
      height: Math.round(box.height),
      renderedRatio: Number((box.width / box.height).toFixed(3))
    };
  });
  result.mobileMonitorScreen = await page.locator(".monitor-screen").evaluate((screen) => {
    const box = screen.getBoundingClientRect();
    return {
      width: Math.round(box.width),
      height: Math.round(box.height),
      renderedRatio: Number((box.width / box.height).toFixed(3))
    };
  });
  result.consoleErrors = errors;
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

main().catch(async (error) => {
  console.error(error);
  if (server.listening) await new Promise((resolve) => server.close(resolve));
  process.exitCode = 1;
});
