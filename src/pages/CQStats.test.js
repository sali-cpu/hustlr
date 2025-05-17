import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import CQStats from "../pages/CQStats";
import { BrowserRouter } from "react-router-dom";
import { get, ref } from 'firebase/database';
import { db, applications_db } from '../firebaseConfig';

// Mock Firebase and components
jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
  applications_db: {}
}));

// Mock localStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn(() => "test-user-uid");
});

describe("CQStats Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with default stats when no data is available", async () => {
    // Mock empty Firebase responses
    get.mockImplementation((dbRef) => {
      if (dbRef && dbRef.path === 'jobs') {
        return Promise.resolve({ exists: () => false });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(
      <BrowserRouter>
        <CQStats />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("0", { selector: "p" })).toBeInTheDocument(); // jobsPosted
      expect(screen.getByText("$0", { selector: "p" })).toBeInTheDocument(); // totalSpent
    });
  });

  test("fetches and displays client stats correctly", async () => {
    // Mock Firebase data
    const mockJobs = {
      job1: { clientUID: "test-user-uid", title: "Test Job 1" },
      job2: { clientUID: "other-user", title: "Test Job 2" },
      job3: { clientUID: "test-user-uid", title: "Test Job 3" }
    };

    const mockAcceptedApps = {
      job1: {
        app1: { status: "accepted" },
        app2: { status: "rejected" }
      },
      job3: {
        app3: { status: "accepted" }
      }
    };

    get.mockImplementation((dbRef) => {
      if (dbRef && dbRef.path === 'jobs') {
        return Promise.resolve({
          exists: () => true,
          val: () => mockJobs
        });
      }
      if (dbRef && dbRef.path === 'accepted_applications') {
        return Promise.resolve({
          exists: () => true,
          val: () => mockAcceptedApps
        });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(
      <BrowserRouter>
        <CQStats />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should show 2 jobs posted (job1 and job3)
      const jobsPostedSection = screen.getByRole("heading", { name: /Jobs Posted/i }).parentElement;
      expect(within(jobsPostedSection).getByText("2", { selector: "p" })).toBeInTheDocument();
      
      // Should show 2 active jobs (job1 and job3 have accepted apps)
      const activeJobsSection = screen.getByRole("heading", { name: /Active Jobs/i }).parentElement;
      expect(within(activeJobsSection).getByText("2", { selector: "p" })).toBeInTheDocument();
    });
  });

  test("handles errors when fetching data", async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    get.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <CQStats />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith("Error fetching job/application stats:", "Failed to fetch");
    });

    consoleError.mockRestore();
  });

  test("shows warning when no userUID is found", async () => {
    Storage.prototype.getItem = jest.fn(() => null);
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <CQStats />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledWith("No userUID found.");
    });

    consoleWarn.mockRestore();
  });

  // Keep your existing rendering tests
  test("renders without crashing", () => {
    // ... (your existing test code)
  });
});
