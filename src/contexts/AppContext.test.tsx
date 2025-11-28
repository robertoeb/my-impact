import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AppProvider, useApp } from "./AppContext";

function TestComponent() {
  const { theme, setTheme, locale, setLocale, t, resolvedTheme } = useApp();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translation">{t("header.title")}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("system")}>Set System</button>
      <button onClick={() => setLocale("pt-BR")}>Set PT</button>
      <button onClick={() => setLocale("en-US")}>Set EN</button>
    </div>
  );
}

describe("AppContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    document.documentElement.classList.remove("light", "dark");
  });

  it("provides default theme as system", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
  });

  it("provides default locale based on browser or en-US", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const locale = screen.getByTestId("locale").textContent;
    expect(["en-US", "pt-BR"]).toContain(locale);
  });

  it("allows changing theme to dark", async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByText("Set Dark").click();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(localStorage.setItem).toHaveBeenCalledWith("myimpact-theme", "dark");
  });

  it("allows changing theme to light", async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByText("Set Light").click();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("allows changing locale to Portuguese", async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByText("Set PT").click();
    });

    expect(screen.getByTestId("locale")).toHaveTextContent("pt-BR");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "myimpact-locale",
      "pt-BR"
    );
  });

  it("translates keys correctly in English", async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByText("Set EN").click();
    });

    const translation = screen.getByTestId("translation").textContent;
    expect(translation).toBeTruthy();
  });

  it("translates keys correctly in Portuguese", async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByText("Set PT").click();
    });

    const translation = screen.getByTestId("translation").textContent;
    expect(translation).toBeTruthy();
  });

  it("loads saved theme from localStorage", () => {
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === "myimpact-theme") return "dark";
      return null;
    });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("loads saved locale from localStorage", () => {
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === "myimpact-locale") return "pt-BR";
      return null;
    });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("locale")).toHaveTextContent("pt-BR");
  });

  it("applies theme class to document", async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByText("Set Dark").click();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("throws error when useApp is used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useApp must be used within an AppProvider"
    );

    consoleSpy.mockRestore();
  });

  it("returns key when translation not found", async () => {
    function TranslationTest() {
      const { t } = useApp();
      return <span data-testid="missing">{t("non.existent.key")}</span>;
    }

    render(
      <AppProvider>
        <TranslationTest />
      </AppProvider>
    );

    expect(screen.getByTestId("missing")).toHaveTextContent("non.existent.key");
  });

  it("handles translation with parameters", async () => {
    function ParamTest() {
      const { t } = useApp();
      return <span data-testid="param">{t("ai.basedOnPrs", { count: 5 })}</span>;
    }

    render(
      <AppProvider>
        <ParamTest />
      </AppProvider>
    );

    expect(screen.getByTestId("param")).toHaveTextContent("5");
  });
});

