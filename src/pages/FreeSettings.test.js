import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FreeSettings from "../pages/FreeSettings";
import { BrowserRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("FreeSettings Component", () => {
  test("renders all settings options and header", () => {
    render(
      <BrowserRouter>
        <FreeSettings />
      </BrowserRouter>
    );

    // Header check
    expect(screen.getByRole("heading", { name: /Settings/i })).toBeInTheDocument();

    // Input field
    expect(screen.getByPlaceholderText("Search for a setting...")).toBeInTheDocument();

    // Settings options
    expect(screen.getByText(/👤 Account/i)).toBeInTheDocument();
    expect(screen.getByText(/🔔 Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/👁️ Appearance/i)).toBeInTheDocument();
    expect(screen.getByText(/🔒 Privacy & Security/i)).toBeInTheDocument();
    expect(screen.getByText(/🎧 Help and Support/i)).toBeInTheDocument();
    expect(screen.getByText(/ℹ️ About/i)).toBeInTheDocument();
  });

  test("clicking back button triggers navigate(-1)", () => {
    render(
      <BrowserRouter>
        <FreeSettings />
      </BrowserRouter>
    );

    const backButton = screen.getByRole("button", { name: /←/i });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
