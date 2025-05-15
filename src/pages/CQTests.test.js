import React from "react";
import { render, screen, within } from "@testing-library/react";
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

    // More specific queries for the counts to avoid duplicates

    // Jobs Posted count
    const jobsPostedSection = screen.getByRole("heading", { name: /Jobs Posted/i }).parentElement;
    expect(within(jobsPostedSection).getByText("0", { selector: "p" })).toBeInTheDocument();

    // Total Spent count (assuming the $0 is inside a <p>)
    const totalSpentSection = screen.getByRole("heading", { name: /Total Spent/i }).parentElement;
    expect(within(totalSpentSection).getByText("$0", { selector: "p" })).toBeInTheDocument();

    // Completion Rate percentage
    const completionRateSection = screen.getByRole("heading", { name: /Completion Rate/i }).parentElement;
    expect(within(completionRateSection).getByText(/0%/, { selector: "p" })).toBeInTheDocument();
  });
});
