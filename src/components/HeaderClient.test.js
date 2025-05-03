import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import HeaderClient from "./HeaderClient";
import React from "react";

test("menu toggle opens and closes mobile menu", () => {
  render(<HeaderClient />);

  const buttons = screen.getAllByRole("button");
  const openButton = buttons.find(btn => btn.id === "menopen");
  const closeButton = buttons.find(btn => btn.id === "menclose");

  // Before clicking: class should not exist
  expect(document.body.classList.contains("show-mobile-menu")).toBe(false);

  // Open menu
  fireEvent.click(openButton);
  expect(document.body.classList.contains("show-mobile-menu")).toBe(true);

  // Close menu
  fireEvent.click(closeButton);
  expect(document.body.classList.contains("show-mobile-menu")).toBe(false);
});
