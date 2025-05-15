// CQStats.test.js

import React from "react";
import { render, screen } from "@testing-library/react";
import CQStats from "../pages/CQStats";
import { BrowserRouter } from "react-router-dom";

// Mock localStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn(() => "test-user-uid");
});

describe("CQStats Component", () => {
  test("renders without crashing", () => {
    render(
      <BrowserRouter>
        <CQStats />
      </BrowserRouter>
    );

    // Check for main title
    expect(screen.getByRole("heading", { name: /Client Reports/i })).toBeInTheDocument();

    // Check for section titles
    expect(screen.getByRole("heading", { name: /Jobs Posted/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Active Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Completed Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Total Spent/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Completion Rate/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Payments Trend/i })).toBeInTheDocument();

    // Default values
    expect(screen.getByText("0")).toBeInTheDocument(); // Jobs Posted
    expect(screen.getByText("$0")).toBeInTheDocument(); // Total Spent
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0); // Completion Rate
  });
});
