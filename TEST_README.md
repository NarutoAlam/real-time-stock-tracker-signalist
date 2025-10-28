# Test Suite Documentation

This document describes the comprehensive test suite for the stock market application's search feature implementation.

## Overview

The test suite covers all files modified in the `implement-search` branch:
- `hooks/useDebounce.ts` - Custom debounce hook
- `components/SearchCommand.tsx` - Stock search dialog component
- `components/NavItems.tsx` - Navigation items with search integration
- `components/Header.tsx` - Header with stock data fetching
- `components/UserDropdown.tsx` - User dropdown with navigation

## Test Framework

- **Framework**: Jest 29.7.0
- **Testing Library**: React Testing Library 14.1.2
- **Environment**: jsdom (browser environment simulation)
- **Coverage Target**: 70% for branches, functions, lines, and statements

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Files

### 1. `hooks/__tests__/useDebounce.test.ts`

Tests the custom debounce hook implementation.

### Test Coverage

- ✅ Returns a debounced function
- ✅ Debounces callback execution
- ✅ Cancels previous timeout on multiple calls
- ✅ Respects delay parameter
- ✅ Handles zero delay
- ✅ Creates stable function references
- ✅ Updates when callback or delay changes
- ✅ Cleans up on component unmount
- ✅ Handles rapid successive calls
- ✅ Allows multiple debounced sequences
- ✅ Handles negative delay gracefully

**Total Tests**: 12

### 2. `components/__tests__/SearchCommand.test.tsx`

Tests the stock search dialog component with comprehensive scenarios.

#### Rendering (4 tests)

- Default button rendering
- Text span rendering
- Custom label support
- Dialog visibility

#### Dialog Interaction (6 tests)

- Button click opens dialog
- Text click opens dialog
- Cmd+K/Ctrl+K keyboard shortcuts
- Prevent default behavior
- Case-insensitive shortcuts

#### Initial Stock Display (5 tests)

- "Popular stocks" label
- Display up to 10 stocks
- Stock information rendering
- Empty stocks handling
- Stock count display

#### Search Functionality (9 tests)

- API call on search
- Display search results
- Loading state
- Whitespace trimming
- Empty results handling
- API error handling
- Reset on clear
- Whitespace-only search prevention

#### Stock Selection (4 tests)

- Navigation to stock detail page
- Dialog close on selection
- Search term reset
- Initial stocks restoration

#### Edge Cases (5 tests)

- Undefined initialStocks
- Missing stock properties
- Icon rendering
- Long stock names
- Special characters

#### Cleanup (1 test)

- Event listener removal on unmount

**Total Tests**: 34

### 3. `components/__tests__/NavItems.test.tsx`

Tests the navigation items component with active state management.

#### Rendering (5 tests)

- All navigation items display
- Link rendering (except Search)
- Search as SearchCommand component
- Props passing to SearchCommand
- Correct item order

#### Active State (6 tests)

- Dashboard highlight on home
- Watchlist highlight
- Non-active links
- Nested routes handling
- Dashboard exact match only
- Other routes handling

#### Link Attributes (2 tests)

- Correct href attributes
- Hover effect classes

#### Responsive Classes (3 tests)

- Flex layout classes
- Responsive gap classes
- Font styling

#### Edge Cases (4 tests)

- Empty initialStocks array
- Undefined pathname
- Null initialStocks
- Large initialStocks array

#### Integration (2 tests)

- Correct number of items
- Dynamic NAV_ITEMS handling

**Total Tests**: 22

### 4. `components/__tests__/Header.test.tsx`

Tests the async server component for header rendering.

#### Rendering (6 tests)

- Logo rendering with attributes
- Logo as home link
- NavItems component rendering
- UserDropdown component rendering
- Sticky header classes
- Container wrapper classes

#### Initial Stocks Fetching (5 tests)

- Fetch on mount
- Pass stocks to NavItems
- Pass stocks to UserDropdown
- Empty stocks array handling
- Error handling

#### User Prop (2 tests)

- Pass user to UserDropdown
- Different user data handling

#### Logo Rendering (2 tests)

- Correct logo source
- Logo styling classes

#### Responsive Behavior (1 test)

- Hide NavItems on small screens

#### Server Component Behavior (2 tests)

- Async server component
- Await searchStocks

#### Integration (2 tests)

- Complete header structure
- Same stocks to both components

#### Edge Cases (3 tests)

- Special characters in name
- Very long names
- Large number of stocks

**Total Tests**: 23

### 5. `components/__tests__/UserDropdown.test.tsx`

Tests the user dropdown with logout functionality and mobile navigation.

#### Rendering (5 tests)

- Avatar button rendering
- Username display
- User email display
- Avatar fallback initial
- Avatar image source

#### Dropdown Menu (4 tests)

- Open on button click
- User information display
- Logout button with icon
- NavItems in mobile view

#### Logout Functionality (4 tests)

- signOut call on logout
- Redirect to sign-in
- Error handling
- Graceful failures

#### Responsive Behavior (3 tests)

- Hide name on small screens
- Hide logout icon on small screens
- Mobile-only NavItems

#### Initial Stocks Prop (2 tests)

- Pass to NavItems
- Empty stocks handling

#### Styling (4 tests)

- Button styling
- Dropdown content styling
- Logout item styling
- Separators styling

#### Avatar Display (4 tests)

- Avatar size
- Larger avatar in dropdown
- Fallback character
- Single-character names

#### Edge Cases (6 tests)

- Very long names
- Very long emails
- Special characters in name
- Special characters in email
- Null initialStocks
- Undefined properties

#### Integration (2 tests)

- Dropdown state management
- Stocks count to mobile nav

**Total Tests**: 34

## Test Statistics

**Total Test Suites**: 5
**Total Tests**: 125
**Coverage Target**: 70% (branches, functions, lines, statements)

## Testing Best Practices Applied

1. **Comprehensive Coverage**: Tests cover happy paths, edge cases, and error scenarios
2. **Descriptive Naming**: Clear test descriptions that explain what is being tested
3. **Isolation**: Each test is independent with proper setup and teardown
4. **Mocking**: External dependencies are properly mocked
5. **Async Handling**: Proper use of waitFor for async operations
6. **Accessibility**: Tests use semantic queries (getByRole, getByLabelText)
7. **User-Centric**: Tests simulate real user interactions
8. **Edge Cases**: Extensive testing of boundary conditions
9. **Error Handling**: Tests verify graceful error handling
10. **Cleanup**: Tests verify proper cleanup on unmount

## Mocked Dependencies

The following dependencies are mocked in jest.setup.js:
- `next/navigation` (useRouter, usePathname, useSearchParams)
- `next/image` (Image component)
- `next/link` (Link component)

Additional mocks per test file:
- `@/lib/actions/finnhub.actions` (searchStocks)
- `@/lib/actions/auth.actions` (signOut)
- `@/hooks/useDebounce` (in SearchCommand tests)
- Child components (in integration tests)

## Known Limitations

1. Server components are tested by awaiting their promises and rendering the result
2. Radix UI components are tested through their rendered DOM structure
3. Keyboard shortcuts are tested with simulated events
4. Dialog open/close state is tested through presence/absence of elements

## Future Improvements

- Add integration tests for complete user flows
- Add visual regression tests
- Add performance benchmarks for debounce timing
- Add accessibility audit tests
- Add E2E tests with Playwright or Cypress

## Continuous Integration

Tests should be run on:
- Every commit
- Every pull request
- Before deployment
- Scheduled daily runs

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Maintain coverage above 70%
3. Follow existing test patterns
4. Update this documentation
5. Run full test suite before committing

## Support

For questions or issues with tests:
- Check test output for detailed error messages
- Review test documentation in individual files
- Consult React Testing Library documentation
- Check Jest documentation for advanced features