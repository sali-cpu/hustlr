describe('Additional SignIn Tests', () => {
  test('goToPage function navigates to correct routes', () => {
    const { goToPage } = render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    ).container.firstChild.props.children.props.children.props.children[1].type;

    goToPage('client');
    expect(mockNavigate).toHaveBeenCalledWith('/Client');
    
    mockNavigate.mockClear();
    goToPage('freelancer');
    expect(mockNavigate).toHaveBeenCalledWith('/Freelancer');
    
    mockNavigate.mockClear();
    goToPage('admin');
    expect(mockNavigate).toHaveBeenCalledWith('/Admin');
    
    mockNavigate.mockClear();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    goToPage('unknown');
    expect(window.alert).toHaveBeenCalledWith('Role not found for this user.');
  });

  test('redirects to admin page if user is admin', async () => {
    signInWithPopup.mockResolvedValue({
      user: { 
        uid: 'admin123', 
        displayName: 'Admin User', 
        email: 'ahustlr70@gmail.com' 
      },
    });

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Admin');
      expect(get).not.toHaveBeenCalled(); // Should not check DB for admin
    });
  });

  test('handles Microsoft sign-in', async () => {
    signInWithPopup.mockResolvedValue({
      user: { uid: 'ms123', displayName: 'MS User', email: 'msuser@example.com' },
    });

    get.mockResolvedValue({
      exists: () => true,
      val: () => ({ role: 'freelancer' }),
    });

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Sign in with Microsoft/i));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/Freelancer');
    });
  });
});
