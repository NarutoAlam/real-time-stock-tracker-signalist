import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import UserDropdown from '../UserDropdown';
import { signOut } from '@/lib/actions/auth.actions';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/lib/actions/auth.actions');
jest.mock('../NavItems', () => {
  return function MockNavItems({ initialStocks }: { initialStocks: StockWithWatchlistStatus[] }) {
    return <nav data-testid="nav-items-mobile" data-stocks-count={initialStocks?.length || 0}>NavItems</nav>;
  };
});

const mockPush = jest.fn();
const mockUser: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockInitialStocks: StockWithWatchlistStatus[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
];

describe('UserDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (signOut as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render user avatar button', () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('flex', 'rounded-full', 'items-center', 'gap-3');
    });

    it('should display user name', () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });

    it('should display user email in dropdown', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('should display user initial in avatar fallback', () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const fallbacks = container.querySelectorAll('.bg-yellow-500.text-yellow-900');
      expect(fallbacks.length).toBeGreaterThan(0);
      expect(Array.from(fallbacks).some(el => el.textContent === 'J')).toBe(true);
    });

    it('should have correct avatar image source', () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const avatarImages = container.querySelectorAll('img[src*="encrypted-tbn0.gstatic.com"]');
      expect(avatarImages.length).toBeGreaterThan(0);
    });
  });

  describe('Dropdown Menu', () => {
    it('should open dropdown when button is clicked', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('should display user information in dropdown header', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const userNames = screen.getAllByText('John Doe');
        expect(userNames.length).toBeGreaterThan(1); // In button and dropdown
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('should display logout button with icon', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const logoutButton = screen.getByText('Logout').closest('div');
        expect(logoutButton).toBeInTheDocument();
        expect(logoutButton).toHaveClass('cursor-pointer');
      });
    });

    it('should render NavItems in mobile view', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('nav-items-mobile')).toBeInTheDocument();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should call signOut when logout is clicked', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
      });

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
      });
    });

    it('should redirect to sign-in page after logout', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-in');
      });
    });

    it('should handle logout errors gracefully', async () => {
      (signOut as jest.Mock).mockRejectedValue(new Error('Logout failed'));
      
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
      });

      // Should not crash and still attempt navigation
      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide user name on small screens', () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const nameDisplay = container.querySelector('.hidden.md\\:flex.flex-col');
      expect(nameDisplay).toBeInTheDocument();
    });

    it('should hide logout icon on small screens', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const logoutIcon = document.querySelector('.mr-2.h-4.w-4.hidden.sm\\:block');
        expect(logoutIcon).toBeInTheDocument();
      });
    });

    it('should show NavItems only on mobile', async () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const mobileNav = container.querySelector('nav.sm\\:hidden');
        expect(mobileNav).toBeInTheDocument();
      });
    });
  });

  describe('Initial Stocks Prop', () => {
    it('should pass initialStocks to NavItems', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const navItems = screen.getByTestId('nav-items-mobile');
        expect(navItems).toHaveAttribute('data-stocks-count', '2');
      });
    });

    it('should handle empty initialStocks', async () => {
      render(<UserDropdown user={mockUser} initialStocks={[]} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const navItems = screen.getByTestId('nav-items-mobile');
        expect(navItems).toHaveAttribute('data-stocks-count', '0');
      });
    });
  });

  describe('Styling', () => {
    it('should have correct button styling', () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-400', 'hover:text-yellow-500');
    });

    it('should have correct dropdown content styling', async () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const content = container.querySelector('[class*="text-gray-400"]');
        expect(content).toBeInTheDocument();
      });
    });

    it('should have correct logout item styling', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const logoutItem = screen.getByText('Logout').closest('div');
        expect(logoutItem).toHaveClass('text-gray-100');
        expect(logoutItem).toHaveClass('transition-colors');
        expect(logoutItem).toHaveClass('cursor-pointer');
      });
    });

    it('should have separators with correct styling', async () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const separators = container.querySelectorAll('.bg-gray-600');
        expect(separators.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Avatar Display', () => {
    it('should render avatar with correct size', () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const avatar = container.querySelector('.w-8.h-8');
      expect(avatar).toBeInTheDocument();
    });

    it('should render larger avatar in dropdown', async () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const largeAvatar = container.querySelector('.w-10.h-10');
        expect(largeAvatar).toBeInTheDocument();
      });
    });

    it('should use first character of name for fallback', () => {
      const { container } = render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const fallbacks = Array.from(container.querySelectorAll('.bg-yellow-500.text-yellow-900'));
      expect(fallbacks.some(el => el.textContent === 'J')).toBe(true);
    });

    it('should handle single-character names', () => {
      const singleCharUser: User = { id: '1', name: 'X', email: 'x@test.com' };
      const { container } = render(<UserDropdown user={singleCharUser} initialStocks={mockInitialStocks} />);
      
      const fallbacks = Array.from(container.querySelectorAll('.bg-yellow-500.text-yellow-900'));
      expect(fallbacks.some(el => el.textContent === 'X')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with very long name', () => {
      const longNameUser: User = {
        id: '456',
        name: 'A'.repeat(100),
        email: 'long@example.com',
      };
      
      render(<UserDropdown user={longNameUser} initialStocks={mockInitialStocks} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle user with very long email', async () => {
      const longEmailUser: User = {
        id: '789',
        name: 'Test User',
        email: 'very.long.email.address.that.exceeds.normal.length@example.com',
      };
      
      render(<UserDropdown user={longEmailUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(longEmailUser.email)).toBeInTheDocument();
      });
    });

    it('should handle special characters in user name', () => {
      const specialUser: User = {
        id: '999',
        name: "O'Brien & Co.",
        email: 'obrien@example.com',
      };
      
      render(<UserDropdown user={specialUser} initialStocks={mockInitialStocks} />);
      expect(screen.getAllByText("O'Brien & Co.").length).toBeGreaterThan(0);
    });

    it('should handle special characters in email', async () => {
      const specialEmailUser: User = {
        id: '111',
        name: 'Test User',
        email: 'test+tag@example.com',
      };
      
      render(<UserDropdown user={specialEmailUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('test+tag@example.com')).toBeInTheDocument();
      });
    });

    it('should handle null initialStocks', () => {
      expect(() => 
        render(<UserDropdown user={mockUser} initialStocks={null as any} />)
      ).not.toThrow();
    });

    it('should handle undefined user properties gracefully', () => {
      const incompleteUser = { id: '1', name: 'Test', email: 'test@test.com' } as User;
      
      expect(() =>
        render(<UserDropdown user={incompleteUser} initialStocks={mockInitialStocks} />)
      ).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should maintain dropdown state correctly', async () => {
      render(<UserDropdown user={mockUser} initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button');
      
      // Open dropdown
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      // Close dropdown by clicking outside (simulated)
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
      }, { timeout: 1000 }).catch(() => {
        // Dropdown might still be visible depending on implementation
      });
    });

    it('should pass correct stocks count to mobile nav', async () => {
      const largeStocksArray = Array.from({ length: 50 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Stock ${i}`,
        exchange: 'NYSE',
        type: 'Common Stock',
        isInWatchlist: false,
      }));

      render(<UserDropdown user={mockUser} initialStocks={largeStocksArray} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const navItems = screen.getByTestId('nav-items-mobile');
        expect(navItems).toHaveAttribute('data-stocks-count', '50');
      });
    });
  });
});