import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import NavItems from '../NavItems';
import { NAV_ITEMS } from '@/lib/constants';

jest.mock('next/navigation');

const mockInitialStocks: StockWithWatchlistStatus[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
];

describe('NavItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  describe('Rendering', () => {
    it('should render all navigation items', () => {
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      NAV_ITEMS.forEach(({ label }) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should render navigation items as links except Search', () => {
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      const watchlistLink = screen.getByRole('link', { name: /watchlist/i });
      
      expect(dashboardLink).toBeInTheDocument();
      expect(watchlistLink).toBeInTheDocument();
    });

    it('should render Search as SearchCommand component', () => {
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const searchElement = screen.getByText('Search');
      expect(searchElement.tagName).toBe('SPAN');
      expect(searchElement).toHaveClass('search-text');
    });

    it('should pass initialStocks to SearchCommand', () => {
      const { container } = render(<NavItems initialStocks={mockInitialStocks} />);
      
      const searchLi = container.querySelector('li[key="search-trigger"]');
      expect(searchLi).toBeInTheDocument();
    });

    it('should render items in correct order', () => {
      const { container } = render(<NavItems initialStocks={mockInitialStocks} />);
      
      const listItems = container.querySelectorAll('li');
      expect(listItems[0]).toHaveTextContent('Dashboard');
      expect(listItems[1]).toHaveTextContent('Search');
      expect(listItems[2]).toHaveTextContent('Watchlist');
    });
  });

  describe('Active State', () => {
    it('should highlight Dashboard when on home page', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('text-gray-100');
    });

    it('should highlight Watchlist when on watchlist page', () => {
      (usePathname as jest.Mock).mockReturnValue('/watchlist');
      
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const watchlistLink = screen.getByRole('link', { name: /watchlist/i });
      expect(watchlistLink).toHaveClass('text-gray-100');
    });

    it('should not highlight non-active links', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const watchlistLink = screen.getByRole('link', { name: /watchlist/i });
      expect(watchlistLink).not.toHaveClass('text-gray-100');
    });

    it('should handle nested routes correctly', () => {
      (usePathname as jest.Mock).mockReturnValue('/watchlist/details');
      
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const watchlistLink = screen.getByRole('link', { name: /watchlist/i });
      expect(watchlistLink).toHaveClass('text-gray-100');
    });

    it('should not highlight Dashboard for non-home nested routes', () => {
      (usePathname as jest.Mock).mockReturnValue('/watchlist');
      
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).not.toHaveClass('text-gray-100');
    });

    it('should only highlight home route on exact match', () => {
      (usePathname as jest.Mock).mockReturnValue('/some-other-page');
      
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).not.toHaveClass('text-gray-100');
    });
  });

  describe('Link Attributes', () => {
    it('should have correct href attributes', () => {
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      const watchlistLink = screen.getByRole('link', { name: /watchlist/i });
      
      expect(dashboardLink).toHaveAttribute('href', '/');
      expect(watchlistLink).toHaveAttribute('href', '/watchlist');
    });

    it('should have hover effect classes', () => {
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('hover:text-yellow-500');
      expect(dashboardLink).toHaveClass('transition-colors');
    });
  });

  describe('Responsive Classes', () => {
    it('should have flex layout classes', () => {
      const { container } = render(<NavItems initialStocks={mockInitialStocks} />);
      
      const ul = container.querySelector('ul');
      expect(ul).toHaveClass('flex');
      expect(ul).toHaveClass('flex-col');
      expect(ul).toHaveClass('sm:flex-row');
    });

    it('should have responsive gap classes', () => {
      const { container } = render(<NavItems initialStocks={mockInitialStocks} />);
      
      const ul = container.querySelector('ul');
      expect(ul).toHaveClass('gap-3');
      expect(ul).toHaveClass('sm:gap-10');
    });

    it('should have font styling', () => {
      const { container } = render(<NavItems initialStocks={mockInitialStocks} />);
      
      const ul = container.querySelector('ul');
      expect(ul).toHaveClass('font-medium');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty initialStocks array', () => {
      render(<NavItems initialStocks={[]} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
    });

    it('should handle undefined pathname', () => {
      (usePathname as jest.Mock).mockReturnValue(undefined);
      
      expect(() => render(<NavItems initialStocks={mockInitialStocks} />)).not.toThrow();
    });

    it('should handle null initialStocks', () => {
      expect(() => render(<NavItems initialStocks={null as any} />)).not.toThrow();
    });

    it('should render with large initialStocks array', () => {
      const largeStocks = Array.from({ length: 100 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Stock ${i}`,
        exchange: 'NYSE',
        type: 'Common Stock',
        isInWatchlist: false,
      }));

      render(<NavItems initialStocks={largeStocks} />);
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  describe('Integration with NAV_ITEMS', () => {
    it('should render correct number of items', () => {
      const { container } = render(<NavItems initialStocks={mockInitialStocks} />);
      
      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(NAV_ITEMS.length);
    });

    it('should handle dynamic NAV_ITEMS changes', () => {
      render(<NavItems initialStocks={mockInitialStocks} />);
      
      NAV_ITEMS.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });
  });
});