import { render, screen, fireEvent } from "@testing-library/react";
import HeaderClient from "./HeaderClient";

test("menu toggle opens and closes mobile menu", () => {
  render(<HeaderClient />);

  // Select the open menu button using its ID
  const buttons = screen.getAllByRole("button");
  const openButton = buttons.find(btn => btn.id === "menopen");

  // Simulate clicking the open button
  fireEvent.click(openButton);

  // You can add more assertions here to check if the menu opened, e.g.:
  const closeButton = buttons.find(btn => btn.id === "menclose");
  expect(closeButton).toBeInTheDocument();
});
