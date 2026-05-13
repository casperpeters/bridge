const { expect } = require("@playwright/test");

async function openFreshApp(page) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/?testHooks=1");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#app-heading")).toContainText("Vijfkaart Hoog");

  return pageErrors;
}

async function prepareNorthSouthDeclarerHand(page) {
  const stateSnapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "browser-smoke-0", skipFlow: true });
    app.autoCompleteAuction();
    app.renderAll();
    return {
      contractText: document.querySelector("#contract").textContent,
      statusText: document.querySelector("#status").textContent
    };
  });

  expect(stateSnapshot.contractText).toContain("Zuid");
  expect(stateSnapshot.statusText).toContain("komt uit");
}

async function clickMenuButton(page, selector) {
  const trigger = page.locator("#settings-summary");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.locator(selector).click();
}

module.exports = {
  clickMenuButton,
  openFreshApp,
  prepareNorthSouthDeclarerHand
};
