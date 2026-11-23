// Spec 7 (2026-10-04) and spec 2026-10-05: the reviews auto-scroll moves on, loops back to the
// start and pauses on hover, inside a HeroUI v3 horizontal ScrollShadow. Native v3 Card and Avatar.
import { test, expect } from "@playwright/test";
import { prepare, open } from "../helpers.mjs";

const carousel = (page) => page.locator('#reviews [data-slot="scroll-shadow"]');
const left = (page) => carousel(page).evaluate((el) => el.scrollLeft);

for (const width of [1440, 375]) {
  test.describe(`avis, largeur ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });

    test.beforeEach(async ({ page, context, baseURL }) => {
      await prepare(context, baseURL);
      await open(page, "/");
      await carousel(page).scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);
    });

    test("le carrousel est un ScrollShadow v3 horizontal, sans dégradé fait main", async ({ page }) => {
      await expect(carousel(page)).toHaveAttribute("data-orientation", "horizontal");
      await expect(carousel(page)).toHaveClass(/scroll-shadow--hide-scrollbar/);
      await expect(page.locator("#reviews .bg-linear-to-l")).toHaveCount(0);
    });

    test("défile tout seul d'au moins 30 px en 2,5 s", async ({ page }) => {
      const start = await left(page);
      await expect.poll(async () => (await left(page)) - start, { timeout: 2500, intervals: [100] }).toBeGreaterThanOrEqual(30);
    });

    test("repart au début après la fin de la liste", async ({ page }) => {
      const jump = await carousel(page).evaluate((el) => {
        const max = el.scrollWidth - el.clientWidth;
        el.scrollLeft = max - 2;
        return { max, after: el.scrollLeft };
      });
      expect(jump.after).toBeGreaterThan(jump.max - 50);
      await expect.poll(() => left(page), { timeout: 1000, intervals: [50] }).toBeLessThan(100);
    });

    // Phase 3 review: a scroll made while the carousel runs (find in page, end of a swipe, this
    // test) is kept, and the auto-scroll carries on from there.
    test("un défilement pendant l'animation est gardé", async ({ page }) => {
      const target = await carousel(page).evaluate((el) => {
        const t = Math.round((el.scrollWidth - el.clientWidth) / 2);
        el.scrollLeft = t;
        return el.scrollLeft;
      });
      await page.waitForTimeout(300);
      expect(await left(page)).toBeGreaterThanOrEqual(target - 2);
    });

    // Review focus 5: the pause handlers still reach the scrolling element.
    test("le survol met en pause, la sortie relance", async ({ page }) => {
      const box = await carousel(page).boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(800);
      const paused = await left(page);
      await page.waitForTimeout(600);
      expect(await left(page)).toBe(paused);
      await page.mouse.move(1, 1);
      await expect.poll(async () => (await left(page)) - paused, { timeout: 2500, intervals: [100] }).toBeGreaterThanOrEqual(10);
    });
  });
}

test.describe("cartes d'avis", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
  });

  test("Card et Avatar v3 sans surcharge : coins arrondis, avatar de taille sm", async ({ page }) => {
    const card = page.locator('#reviews [data-slot="card"]').first();
    expect(await card.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(0);
    await expect(card.locator(".avatar")).toHaveClass(/avatar--sm/);
  });

  // "Voir plus" on a long review, now a v3 Button.
  test("Voir plus ouvre le texte, devient Voir moins, sans changer la hauteur de la carte", async ({ page }) => {
    const cards = page.locator('#reviews [data-slot="card"]');
    const index = await cards.evaluateAll((els) => els.findIndex((el) => el.textContent.includes("Voir plus")));
    const card = cards.nth(index);
    const h0 = (await card.boundingBox()).height;
    await card.getByRole("button", { name: "Voir plus" }).click();
    await expect(card.getByRole("button", { name: "Voir moins" })).toBeVisible();
    expect((await card.boundingBox()).height).toBe(h0);
    await card.getByRole("button", { name: "Voir moins" }).click();
    await expect(card.getByRole("button", { name: "Voir plus" })).toBeVisible();
  });
});

// Reviews of 2026-10-05: Cathe and Safdar Butt added, Google shows 12 reviews.
test.describe("avis à jour", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
  });

  // The count follows the Google Business Profile (20 reviews on 2026-11-23).
  test("les nouveaux avis sont dans le carrousel et le compteur affiche 20 avis", async ({ page }) => {
    const cards = page.locator('#reviews [data-slot="card"]');
    await expect(cards.filter({ hasText: "Cathe" })).toContainText("le suivi après les travaux");
    await expect(cards.filter({ hasText: "Safdar Butt" })).toHaveCount(1);
    await expect(cards.filter({ hasText: "Carole Jenner" })).toContainText("fenêtres doubles et triples");
    await expect(page.getByText("· 20 avis Google")).toBeVisible();
  });

  // Latest reviews on Google Maps, read on 2026-11-23, shown first.
  test("les trois derniers avis Google ouvrent le carrousel", async ({ page }) => {
    const cards = page.locator('#reviews [data-slot="card"]');
    await expect(cards.nth(0)).toContainText("Andre Vangrunderbeek");
    await expect(cards.nth(1)).toContainText("Quentin Gontier");
    await expect(cards.nth(2)).toContainText("Jean-Marc blois");
    await expect(cards).toHaveCount(15);
  });

  test("pas de date relative figée sur les cartes", async ({ page }) => {
    await expect(page.locator('#reviews [data-slot="card"]').filter({ hasText: /Il y a/ })).toHaveCount(0);
  });
});

// WCAG 2.2.2: no auto-scroll for visitors who ask for reduced motion, pause while the keyboard
// focus is inside the carousel.
test.describe("avis, accessibilité du défilement", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("réduire les animations : le carrousel ne défile pas tout seul", async ({ page, context, baseURL }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(context, baseURL);
    await open(page, "/");
    await carousel(page).scrollIntoViewIfNeeded();
    await page.mouse.move(1, 1);
    const start = await left(page);
    await page.waitForTimeout(2500);
    expect(await left(page)).toBe(start);
  });

  test("focus clavier dans le carrousel : pause, sortie : reprise", async ({ page, context, baseURL }) => {
    await prepare(context, baseURL);
    await open(page, "/");
    await carousel(page).scrollIntoViewIfNeeded();
    await page.mouse.move(1, 1);
    await carousel(page).getByRole("button", { name: "Voir plus" }).first().focus();
    await page.waitForTimeout(800);
    const paused = await left(page);
    await page.waitForTimeout(1500);
    expect(await left(page)).toBe(paused);
    await page.locator("h1").first().focus().catch(() => {});
    await page.evaluate(() => document.activeElement?.blur());
    await expect.poll(async () => (await left(page)) - paused, { timeout: 2500, intervals: [100] }).toBeGreaterThanOrEqual(10);
  });
});

// Phase 3 review: requestAnimationFrame stops in a background tab; coming back must not turn the
// whole hidden time into one jump. Frames are held for 3 s to reproduce it.
test("retour sur l'onglet : pas de saut du carrousel", async ({ page, context, baseURL }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepare(context, baseURL);
  await page.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window);
    const held = [];
    window.__holdFrames = false;
    window.requestAnimationFrame = (cb) => (window.__holdFrames ? (held.push(cb), 0) : raf(cb));
    window.__releaseFrames = () => { window.__holdFrames = false; held.splice(0).forEach((cb) => raf(cb)); };
  });
  await open(page, "/");
  await carousel(page).scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  await page.evaluate(() => { window.__holdFrames = true; });
  await page.waitForTimeout(3000);
  const before = await left(page);
  await page.evaluate(() => window.__releaseFrames());
  await page.waitForTimeout(150);
  expect((await left(page)) - before).toBeLessThan(30);
});

// A review cut by the 3-line clamp always offers "Voir plus", whatever its length in characters
// (Andre Vangrunderbeek's 177 characters were cut without the button).
for (const width of [1440, 375]) {
  test(`${width} px : chaque avis tronqué a son bouton Voir plus`, async ({ page, context, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    await prepare(context, baseURL);
    await open(page, "/");
    const cards = page.locator('#reviews [data-slot="card"]');
    await expect(cards.first()).toBeVisible();
    const missing = await cards.evaluateAll((els) => els
      .filter((el) => {
        const p = el.querySelector("p.line-clamp-3");
        return p && p.scrollHeight > p.clientHeight + 1 && !el.textContent.includes("Voir plus");
      })
      .map((el) => el.querySelector("p")?.textContent));
    expect(missing).toEqual([]);
  });
}
