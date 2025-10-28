import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchCommand from '../SearchCommand';
import { searchStocks } from '@/lib/actions/finnhub.actions';

// Mock dependencies
jest.mock('@/lib/actions/finnhub.actions');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (callback: () => void) => callback,
}));

const mockInitialStocks: StockWithWatchlistStatus[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: true },
];

const mockSearchResults: StockWithWatchlistStatus[] = [
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
];

describe('SearchCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (searchStocks as jest.Mock).mockResolvedValue(mockSearchResults);
  });

  describe('Rendering', () => {
    it('should render button by default', () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button', { name: /add stock/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('search-btn');
    });

    it('should render text span when renderAs is "text"', () => {
      render(<SearchCommand renderAs="text" label="Search" initialStocks={mockInitialStocks} />);
      
      const textElement = screen.getByText('Search');
      expect(textElement).toBeInTheDocument();
      expect(textElement.tagName).toBe('SPAN');
      expect(textElement).toHaveClass('search-text');
    });

    it('should render with custom label', () => {
      render(<SearchCommand label="Custom Label" initialStocks={mockInitialStocks} />);
      
      expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument();
    });

    it('should not show dialog initially', () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      expect(screen.queryByPlaceholderText('Search stocks...')).not.toBeInTheDocument();
    });
  });

  describe('Dialog Interaction', () => {
    it('should open dialog when button is clicked', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      const button = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument();
      });
    });

    it('should open dialog when text is clicked', async () => {
      render(<SearchCommand renderAs="text" label="Search" initialStocks={mockInitialStocks} />);
      
      const textElement = screen.getByText('Search');
      fireEvent.click(textElement);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument();
      });
    });

    it('should toggle dialog with Cmd+K on Mac', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.keyDown(window, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument();
      });
    });

    it('should toggle dialog with Ctrl+K on Windows/Linux', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument();
      });
    });

    it('should prevent default behavior on keyboard shortcut', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, cancelable: true });
      const preventDefaultSpy = jest.spn(event, 'preventDefault');
      
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle case-insensitive keyboard shortcut', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.keyDown(window, { key: 'K', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument();
      });
    });
  });

  describe('Initial Stock Display', () => {
    it('should display "Popular stocks" label when no search term', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText(/popular stocks/i)).toBeInTheDocument();
      });
    });

    it('should display up to 10 initial stocks', async () => {
      const manyStocks = Array.from({ length: 15 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Stock ${i}`,
        exchange: 'NYSE',
        type: 'Common Stock',
        isInWatchlist: false,
      }));

      render(<SearchCommand initialStocks={manyStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText(/popular stocks \(10\)/i)).toBeInTheDocument();
      });
    });

    it('should display stock information correctly', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.getByText(/AAPL \| NASDAQ \| Common Stock/)).toBeInTheDocument();
      });
    });

    it('should show "No stocks available" when initialStocks is empty', async () => {
      render(<SearchCommand initialStocks={[]} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText('No stocks available')).toBeInTheDocument();
      });
    });

    it('should display correct count of stocks', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should call searchStocks when user types in search field', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: 'TSLA' } });

      await waitFor(() => {
        expect(searchStocks).toHaveBeenCalledWith('TSLA');
      });
    });

    it('should display search results after searching', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: 'TSLA' } });

      await waitFor(() => {
        expect(screen.getByText('Tesla, Inc.')).toBeInTheDocument();
        expect(screen.getByText(/search results/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while searching', async () => {
      (searchStocks as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 100)));

      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: 'TSLA' } });

      await waitFor(() => {
        expect(screen.getByText('Loading stocks...')).toBeInTheDocument();
      });
    });

    it('should trim whitespace from search term', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: '  TSLA  ' } });

      await waitFor(() => {
        expect(searchStocks).toHaveBeenCalledWith('TSLA');
      });
    });

    it('should show "No results found" when search returns empty array', async () => {
      (searchStocks as jest.Mock).mockResolvedValue([]);

      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: 'INVALID' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should handle search API errors gracefully', async () => {
      (searchStocks as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: 'ERROR' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should reset to initial stocks when search term is cleared', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      
      fireEvent.change(searchInput, { target: { value: 'TSLA' } });
      await waitFor(() => {
        expect(screen.getByText('Tesla, Inc.')).toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.getByText(/popular stocks/i)).toBeInTheDocument();
      });
    });

    it('should not call searchStocks when search term is only whitespace', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      await waitFor(() => {
        expect(searchStocks).not.toHaveBeenCalled();
      });
    });
  });

  describe('Stock Selection', () => {
    it('should navigate to stock detail page when stock is clicked', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /apple inc\./i });
        expect(link).toHaveAttribute('href', '/stocks/AAPL');
      });
    });

    it('should close dialog when stock is selected', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const link = await screen.findByRole('link', { name: /apple inc\./i });
      fireEvent.click(link);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search stocks...')).not.toBeInTheDocument();
      });
    });

    it('should reset search term when stock is selected', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: 'TSLA' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('TSLA');
      });

      const link = await screen.findByRole('link', { name: /tesla, inc\./i });
      fireEvent.click(link);

      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const newSearchInput = await screen.findByPlaceholderText('Search stocks...');
      expect(newSearchInput).toHaveValue('');
    });

    it('should reset to initial stocks when stock is selected', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      const searchInput = await screen.findByPlaceholderText('Search stocks...');
      fireEvent.change(searchInput, { target: { value: 'TSLA' } });

      await waitFor(() => {
        expect(screen.getByText('Tesla, Inc.')).toBeInTheDocument();
      });

      const link = await screen.findByRole('link', { name: /tesla, inc\./i });
      fireEvent.click(link);

      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined initialStocks gracefully', async () => {
      render(<SearchCommand initialStocks={undefined as any} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText('No stocks available')).toBeInTheDocument();
      });
    });

    it('should handle stocks with missing properties', async () => {
      const incompleteStocks = [
        { symbol: 'TEST', name: '', exchange: 'NYSE', type: 'Stock', isInWatchlist: false },
      ] as StockWithWatchlistStatus[];

      render(<SearchCommand initialStocks={incompleteStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText('TEST')).toBeInTheDocument();
      });
    });

    it('should display TrendingUp icon for each stock', async () => {
      render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        const icons = document.querySelectorAll('.h-4.w-4.text-gray-500');
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it('should handle very long stock names', async () => {
      const longNameStock = [{
        symbol: 'LONG',
        name: 'A'.repeat(200),
        exchange: 'NYSE',
        type: 'Common Stock',
        isInWatchlist: false,
      }];

      render(<SearchCommand initialStocks={longNameStock} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
      });
    });

    it('should handle special characters in stock names', async () => {
      const specialStock = [{
        symbol: 'TEST',
        name: 'Test & Co. (Special)',
        exchange: 'NYSE',
        type: 'Common Stock',
        isInWatchlist: false,
      }];

      render(<SearchCommand initialStocks={specialStock} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

      await waitFor(() => {
        expect(screen.getByText('Test & Co. (Special)')).toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    it('should remove keyboard event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<SearchCommand initialStocks={mockInitialStocks} />);
      
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});