import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Header from '../Header';
import { searchStocks } from '@/lib/actions/finnhub.actions';

// Mock dependencies
jest.mock('@/lib/actions/finnhub.actions');
jest.mock('../NavItems', () => {
  return function MockNavItems({ initialStocks }: { initialStocks: StockWithWatchlistStatus[] }) {
    return <nav data-testid="nav-items" data-stocks-count={initialStocks?.length || 0}>NavItems</nav>;
  };
});
jest.mock('../UserDropdown', () => {
  return function MockUserDropdown({ user, initialStocks }: { user: User; initialStocks: StockWithWatchlistStatus[] }) {
    return (
      <div data-testid="user-dropdown" data-user-name={user.name} data-stocks-count={initialStocks?.length || 0}>
        UserDropdown
      </div>
    );
  };
});

const mockUser: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockStocks: StockWithWatchlistStatus[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
];

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (searchStocks as jest.Mock).mockResolvedValue(mockStocks);
  });

  describe('Rendering', () => {
    it('should render header with logo', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const logo = screen.getByAltText('logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('width', '140');
      expect(logo).toHaveAttribute('height', '32');
    });

    it('should render logo as a link to home', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      const { container } = render(HeaderComponent);
      
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toBeInTheDocument();
    });

    it('should render NavItems component', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      expect(screen.getByTestId('nav-items')).toBeInTheDocument();
    });

    it('should render UserDropdown component', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      expect(screen.getByTestId('user-dropdown')).toBeInTheDocument();
    });

    it('should have sticky header with correct classes', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      const { container } = render(HeaderComponent);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('header');
    });

    it('should have container wrapper with correct classes', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      const { container } = render(HeaderComponent);
      
      const containerDiv = container.querySelector('.container.header-wrapper');
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe('Initial Stocks Fetching', () => {
    it('should fetch initial stocks on mount', async () => {
      await Header({ user: mockUser });
      
      expect(searchStocks).toHaveBeenCalledWith();
      expect(searchStocks).toHaveBeenCalledTimes(1);
    });

    it('should pass fetched stocks to NavItems', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const navItems = screen.getByTestId('nav-items');
      expect(navItems).toHaveAttribute('data-stocks-count', '2');
    });

    it('should pass fetched stocks to UserDropdown', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const userDropdown = screen.getByTestId('user-dropdown');
      expect(userDropdown).toHaveAttribute('data-stocks-count', '2');
    });

    it('should handle empty stocks array', async () => {
      (searchStocks as jest.Mock).mockResolvedValue([]);
      
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const navItems = screen.getByTestId('nav-items');
      expect(navItems).toHaveAttribute('data-stocks-count', '0');
    });

    it('should handle searchStocks errors gracefully', async () => {
      (searchStocks as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      await expect(Header({ user: mockUser })).rejects.toThrow('API Error');
    });
  });

  describe('User Prop', () => {
    it('should pass user to UserDropdown', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const userDropdown = screen.getByTestId('user-dropdown');
      expect(userDropdown).toHaveAttribute('data-user-name', 'John Doe');
    });

    it('should handle different user data', async () => {
      const differentUser: User = {
        id: '456',
        name: 'Jane Smith',
        email: 'jane@example.com',
      };
      
      const HeaderComponent = await Header({ user: differentUser });
      render(HeaderComponent);
      
      const userDropdown = screen.getByTestId('user-dropdown');
      expect(userDropdown).toHaveAttribute('data-user-name', 'Jane Smith');
    });
  });

  describe('Logo Rendering', () => {
    it('should render logo with correct source', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const logo = screen.getByAltText('logo');
      expect(logo).toHaveAttribute('src', '/assets/icons/logo.svg');
    });

    it('should have cursor-pointer class on logo', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const logo = screen.getByAltText('logo');
      expect(logo).toHaveClass('cursor-pointer');
      expect(logo).toHaveClass('w-auto');
      expect(logo).toHaveClass('h-8');
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide NavItems on small screens', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      const { container } = render(HeaderComponent);
      
      const nav = container.querySelector('nav.hidden.sm\\:block');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Server Component Behavior', () => {
    it('should be an async server component', () => {
      expect(Header({ user: mockUser })).toBeInstanceOf(Promise);
    });

    it('should await searchStocks before rendering', async () => {
      let resolveSearch: (value: StockWithWatchlistStatus[]) => void;
      const searchPromise = new Promise<StockWithWatchlistStatus[]>((resolve) => {
        resolveSearch = resolve;
      });
      
      (searchStocks as jest.Mock).mockReturnValue(searchPromise);
      
      const headerPromise = Header({ user: mockUser });
      
      // searchStocks should have been called
      expect(searchStocks).toHaveBeenCalled();
      
      // Resolve the search
      resolveSearch!(mockStocks);
      
      // Wait for header to resolve
      const HeaderComponent = await headerPromise;
      render(HeaderComponent);
      
      expect(screen.getByTestId('nav-items')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render complete header structure', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      const { container } = render(HeaderComponent);
      
      // Check structure
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      
      const containerDiv = header?.querySelector('.container.header-wrapper');
      expect(containerDiv).toBeInTheDocument();
      
      // Check all main elements are present
      expect(screen.getByAltText('logo')).toBeInTheDocument();
      expect(screen.getByTestId('nav-items')).toBeInTheDocument();
      expect(screen.getByTestId('user-dropdown')).toBeInTheDocument();
    });

    it('should pass same stocks to both NavItems and UserDropdown', async () => {
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const navItems = screen.getByTestId('nav-items');
      const userDropdown = screen.getByTestId('user-dropdown');
      
      expect(navItems.getAttribute('data-stocks-count')).toBe(
        userDropdown.getAttribute('data-stocks-count')
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with special characters in name', async () => {
      const specialUser: User = {
        id: '789',
        name: "O'Brien & Co.",
        email: 'obrien@example.com',
      };
      
      const HeaderComponent = await Header({ user: specialUser });
      render(HeaderComponent);
      
      const userDropdown = screen.getByTestId('user-dropdown');
      expect(userDropdown).toHaveAttribute('data-user-name', "O'Brien & Co.");
    });

    it('should handle very long user names', async () => {
      const longNameUser: User = {
        id: '999',
        name: 'A'.repeat(100),
        email: 'long@example.com',
      };
      
      const HeaderComponent = await Header({ user: longNameUser });
      render(HeaderComponent);
      
      expect(screen.getByTestId('user-dropdown')).toBeInTheDocument();
    });

    it('should handle large number of stocks', async () => {
      const manyStocks = Array.from({ length: 100 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Stock ${i}`,
        exchange: 'NYSE',
        type: 'Common Stock',
        isInWatchlist: false,
      }));
      
      (searchStocks as jest.Mock).mockResolvedValue(manyStocks);
      
      const HeaderComponent = await Header({ user: mockUser });
      render(HeaderComponent);
      
      const navItems = screen.getByTestId('nav-items');
      expect(navItems).toHaveAttribute('data-stocks-count', '100');
    });
  });
});