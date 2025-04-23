

import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";
import '@testing-library/jest-dom';

describe("Footer Component", () => {
  test("renders About header", () => {
    render(<Footer />);
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  test("renders About Us heading", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { level: 1, name: "About Us" })).toBeInTheDocument();
  });

  test("renders paragraph text", () => {
    render(<Footer />);
    expect(
      screen.getByText(/We connect talented freelancers with clients worldwide/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your go-to platform for hiring top freelancers/i)
    ).toBeInTheDocument();
  });
});

