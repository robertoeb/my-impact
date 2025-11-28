import { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AppProvider } from "@/contexts/AppContext";
import { ReportProvider } from "@/contexts/ReportContext";

interface WrapperProps {
  children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <AppProvider>
      <ReportProvider>{children}</ReportProvider>
    </AppProvider>
  );
}

function AppOnlyProvider({ children }: WrapperProps) {
  return <AppProvider>{children}</AppProvider>;
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

const renderWithAppContext = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AppOnlyProvider, ...options });

export * from "@testing-library/react";
export { customRender as render, renderWithAppContext };

