

import React from "react";
import { render, screen } from "@testing-library/react";
import HeaderClient from "./HeaderClient";
import '@testing-library/jest-dom';

describe("HeaderClient Component", () => {
  beforeEach(() => {
    // Reset body class for each test
    document.body.className = "";
  });

  test("renders logo text", () => {
    render(<HeaderClient />);
    expect(screen.getByText("Hustlr.")).toBeInTheDocument();
  });

  test("renders all navigation links", () => {
    render(<HeaderClient />);
    expect(screen.getByText("Ongoing Projects")).toBeInTheDocument();
    expect(screen.getByText("Earnings")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Recent Activities")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });
});
