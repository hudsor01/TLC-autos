import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const globalsPath = resolve(__dirname, "../src/app/globals.css");
const pkgPath = resolve(__dirname, "../package.json");

function readGlobals(): string {
  return readFileSync(globalsPath, "utf-8");
}

function readPkg(): Record<string, unknown> {
  return JSON.parse(readFileSync(pkgPath, "utf-8"));
}

describe("Design System Foundation", () => {
  describe("dark mode removed (DSYS-01)", () => {
    it("has no dark mode media query", () => {
      const css = readGlobals();
      expect(css).not.toMatch(/prefers-color-scheme:\s*dark/);
    });

    it("sets color-scheme: light on html", () => {
      const css = readGlobals();
      expect(css).toMatch(/html\s*\{[\s\S]*?color-scheme:\s*light/);
    });

    it("has no --hero or --hero-foreground variables", () => {
      const css = readGlobals();
      expect(css).not.toContain("--hero:");
      expect(css).not.toContain("--hero-foreground:");
    });
  });

  describe("palette evolution (DSYS-02)", () => {
    it("has warm white background #faf9f7", () => {
      const css = readGlobals();
      expect(css).toMatch(/--background:\s*#faf9f7/);
    });

    it("has warm muted surface #f5f3f0", () => {
      const css = readGlobals();
      expect(css).toMatch(/--muted:\s*#f5f3f0/);
    });

    it("has darkened muted-foreground #475569", () => {
      const css = readGlobals();
      expect(css).toMatch(/--muted-foreground:\s*#475569/);
    });

    it("has burgundy secondary #a81225", () => {
      const css = readGlobals();
      expect(css).toMatch(/--secondary:\s*#a81225/);
    });

    it("has warm accent #e8f0fa", () => {
      const css = readGlobals();
      expect(css).toMatch(/--accent:\s*#e8f0fa/);
    });

    it("has warm border #e8e4df", () => {
      const css = readGlobals();
      expect(css).toMatch(/--border:\s*#e8e4df/);
    });

    it("preserves navy primary #1e3a5f unchanged", () => {
      const css = readGlobals();
      expect(css).toMatch(/--primary:\s*#1e3a5f/);
    });

    it("preserves sidebar tokens unchanged", () => {
      const css = readGlobals();
      expect(css).toMatch(/--sidebar:\s*#152d4a/);
      expect(css).toMatch(/--sidebar-foreground:\s*#e2e8f0/);
    });
  });

  describe("animation utilities (DSYS-03)", () => {
    it("defines .animate-fade-up class", () => {
      const css = readGlobals();
      expect(css).toContain(".animate-fade-up");
      expect(css).toContain("@keyframes fade-up");
    });

    it("defines .animate-fade-in class", () => {
      const css = readGlobals();
      expect(css).toContain(".animate-fade-in");
      expect(css).toContain("@keyframes fade-in");
    });

    it("defines .animate-slide-up class", () => {
      const css = readGlobals();
      expect(css).toContain(".animate-slide-up");
      expect(css).toContain("@keyframes slide-up");
    });

    it("defines .hover-lift class", () => {
      const css = readGlobals();
      expect(css).toContain(".hover-lift");
    });

    it("defines stagger delay utilities", () => {
      const css = readGlobals();
      expect(css).toContain(".delay-75");
      expect(css).toContain(".delay-150");
      expect(css).toContain(".delay-225");
      expect(css).toContain(".delay-300");
    });
  });

  describe("libraries installed (DSYS-04)", () => {
    it("has motion in dependencies", () => {
      const pkg = readPkg();
      const deps = pkg.dependencies as Record<string, string>;
      expect(deps).toHaveProperty("motion");
    });

    it("has embla-carousel-react in dependencies", () => {
      const pkg = readPkg();
      const deps = pkg.dependencies as Record<string, string>;
      expect(deps).toHaveProperty("embla-carousel-react");
    });

    it("has yet-another-react-lightbox in dependencies", () => {
      const pkg = readPkg();
      const deps = pkg.dependencies as Record<string, string>;
      expect(deps).toHaveProperty("yet-another-react-lightbox");
    });

    it("has tw-animate-css in dependencies", () => {
      const pkg = readPkg();
      const deps = pkg.dependencies as Record<string, string>;
      expect(deps).toHaveProperty("tw-animate-css");
    });

    it("imports tw-animate-css in globals.css after tailwindcss", () => {
      const css = readGlobals();
      const tailwindIdx = css.indexOf('@import "tailwindcss"');
      const twAnimateIdx = css.indexOf('@import "tw-animate-css"');
      expect(tailwindIdx).toBeGreaterThanOrEqual(0);
      expect(twAnimateIdx).toBeGreaterThan(tailwindIdx);
    });
  });
});
